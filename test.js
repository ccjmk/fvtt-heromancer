(async ()=> {
    // Get compendiums
    const raceNames = ['Dragonborn', 'Dwarf', 'Elf', 'Gnome', 'Half-Elf', 'Half-Orc', 'Halfling', 'Human', 'Tiefling']; // race names are listed for filtering actual Races from Racial Features
    let _races = await game.packs.get("dnd5e.races").getContent();
    const races = _races.filter(r => raceNames.includes(r.data.name));
    const racialFeatures = _races.filter(r => !(raceNames.includes(r.data.name)));
    const classes = await game.packs.get("dnd5e.classes").getContent();
    const classFeatures = await game.packs.get("dnd5e.classfeatures").getContent();
/*
//   console.log('---------- RACES ---------------');
// races.forEach((c,i) => console.log(`${i}: ${c.data.name}`));
// console.log('---------- RACIAL FEATURES ---------------');
// racialFeatures.forEach((c,i) => console.log(`${i}: ${c.data.name}`));
//   console.log('---------- CLASSES ---------------');
//   classes.forEach((c,i) => console.log(`${i}: ${c.data.name}`));
//   console.log('---------- CLASS FEATURES ---------------');
// classFeatures.forEach((c,i) => console.log(`${i}: ${c.data.name}`));
*/

    // Ask basic info
    const classNames = Array.from(classes.map(c => c.data.name));
    const basicInfo = [[`What is your name? `, `text`], [`What is your race? `, `select`, raceNames], [`What is your class? `, `select`, classNames], [`Dry-run? `, `checkbox`]];
    let [name, raceSelected, classSelected, dryRun] = await multi_input({ title: `Choose name, race and class`, data: basicInfo });

    const raceItem = races.find(r => r.data.name === raceSelected);
    const classItem = classes.find(c => c.data.name === classSelected);

    console.log(raceItem)
    console.log(classItem)

    // Select starting skills
    const skillsToPick = await classes[0].data.data.skills.number;
    const skillChoicesArray = await classItem.data.data.skills.choices;
    const skillChoices = skillChoicesArray.map(s => `${game.dnd5e.config.skills[s]} ;checkbox`).map(s => s.split(';'));
    console.log(`${name}'s ${classItem.data.name} class available skills (${skillsToPick}): `);
    console.log(skillChoices.map(s => s[0]));
    const selectedSkills = await multi_input({ title: `Choose class skills (${skillsToPick})`, data : skillChoices });


    // Rolling Stats
    

    let actorData = {};
    selectedSkills.forEach((e,i) => e ? (actorData[`skills.${skillChoicesArray[i]}.value`] = 1) : null);
    
    let actor;
    if(!dryRun) {
        // Create actor
        console.log(`Creating..
    Name: ${name}
    Race: ${raceSelected}
    Class: ${classSelected}`);
        
        actor = await Actor.create({
        name: name,
        type: "character",
        img: "icons/svg/mystery-man.svg",
        folder: null,
        sort: 12000,
        data: actorData,
        token: {},
        items: [raceItem, classItem],
        flags: {}
        });
    } else {
        console.log("> DRY-RUN: ");
        console.log(`Name: ${name}`);
        console.log(`Race: ${raceItem.data.name}`);
        console.log(`Class: ${classItem.data.name}`);
        console.log(`Skills: ${selectedSkills.map((s,i) => s ? skillChoicesArray[i] : false).filter(s => s)}`);
    }

    
})();

async function multi_input({title = ``, data = []} = {})
{
    /*
    * Based on multi_input from (pending confirmation) @Kekilla
    * 
    * Expects an array of data objects each with the form [label, type (, [select options])], corresponding to each item to request
    * Type can be text, number, checkbox or select.
    * 
    * If type is select, a 3rd value containing the list of options needs to be provided, 
    * which will be used both as value and as text for the select
    */

    let value = await new Promise((resolve)=> {
    new Dialog({
        title,       
        buttons : {
        Ok : { 
            label : `Ok`, 
            callback : (html) => {
                let selects = html.find("select");
                let html_values = html.find("input");
                resolve(data.map((e,i) => {
                    switch(e[1]) {
                        case "number":
                            return html_values[i].valueAsNumber;
                        case "checkbox":
                            return html_values[i].checked;
                        case "select":
                            return Array.from(selects).find(s => s.name == `${i}-select`).value;
                        default:
                            return html_values[i].value;
                    }
                }));
            }
        }
        },
        content : `<table style="width:100%">${data.map((input, index) => {
            if(input[1] === 'select') {
                let opts = input[2].map(o => `<option value="${o}">${o}</option>`).join(``);
                let select = `<input type="hidden" name="${index}"/><select style="width:100%" name="${index}-select">${opts}</select>`;
                return `<tr>
                        <th style="width:50%">
                        <label>${input[0]}</label>
                        </th>
                        <td style="width:50%">
                        ${select}
                        </td>
                    </tr>`;
            } else {
                return `<tr>
                        <th style="width:50%">
                        <label>${input[0]}</label>
                        </th>
                        <td style="width:50%">
                        <input type="${input[1]}" name="${index}"/>
                        </td>
                    </tr>`;
            }
        }).join(``)}</table>`
    }).render(true);
    });
    return value;
}