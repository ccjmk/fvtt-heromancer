(async ()=> {


    // GET COMPENDIUMS & INITIALIZE DATA
    // -----------------------------------------------
    const raceNames = ['Dragonborn', 'Dwarf', 'Elf', 'Gnome', 'Half-Elf', 'Half-Orc', 'Halfling', 'Human', 'Tiefling']; // race names are listed for filtering actual Races from Racial Features
    let _races = await game.packs.get("dnd5e.races").getContent();
    const races = _races.filter(r => raceNames.includes(r.data.name));
    const racialFeatures = _races.filter(r => !(raceNames.includes(r.data.name)));
    const classes = await game.packs.get("dnd5e.classes").getContent();
    const classFeatures = await game.packs.get("dnd5e.classfeatures").getContent();

    const alignments = ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'];
    let actorData = {}; // used for proficiencies, languages, hp, etc..

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


    // ASK BASIC INFO
    // -----------------------------------------------
    const classNames = Array.from(classes.map(c => c.data.name));
    const basicInfo = [[`What is your name? `, `text`], [`What is your race? `, `select`, raceNames], [`What is your class? `, `select`, classNames], [`What is your background? `, `text`], [`What is your alignment? `, `select`, alignments], [`Dry-run? `, `checkbox`]];
    let [name, raceSelected, classSelected, background, alignment, dryRun] = await multi_input({ title: `Choose name, race and class`, data: basicInfo });

    const raceItem = races.find(r => r.data.name === raceSelected);
//    console.log('Race item: ');
//    console.log(raceItem);

    const classItem = classes.find(c => c.data.name === classSelected);
//    console.log('Class item: ');
//    console.log(classItem)


    // SELECT STARTING SKILLS
    // -----------------------------------------------
    const skillsToPick = await classes[0].data.data.skills.number;
    const skillChoicesArray = await classItem.data.data.skills.choices;
    const skillChoices = skillChoicesArray.map(s => `${game.dnd5e.config.skills[s]} ;checkbox`).map(s => s.split(';'));
//    console.log(`${name}'s ${classItem.data.name} class available skills (${skillsToPick}): `);
//    console.log(skillChoices.map(s => s[0]).join(','));
    const selectedSkills = await multi_input({ title: `Choose class skills (${skillsToPick})`, data : skillChoices });
    selectedSkills.forEach((e,i) => e ? (actorData[`skills.${skillChoicesArray[i]}.value`] = 1) : null);


    // ROLL ABILITIES
    // -----------------------------------------------
    const abilities = Object.keys(game.dnd5e.config.abilities);
    let actorAbilities = [];
    for(let i=0; i<abilities.length; i++) {
        const r = new Roll("4d6kh3").evaluate();
        console.log(`Rolled ${abilities[i]} : ${r.total}`);
        actorAbilities[i] = [abilities[i], r.total];
    }
    actorAbilities.forEach((e,i) => (actorData[`abilities.${e[0]}.value`]) = e[1]);
    

    
    // SET STARTING HP
    // -----------------------------------------------
    let hitDice = classItem.data.data.hitDice;
    // remove the d from 'dXX' and add the constitution modifier
    let conMod = getAbilityModifier(actorAbilities.filter(a => a[0] == 'con').map(a => a[1]));
    actorData['attributes.hp.value'] = parseInt(hitDice.substring(1)) + conMod;

    actorData['details.race'] = raceItem.data.name;
    actorData['details.background'] = background;
    actorData['details.alignment'] = alignment;
    actorData['traits.armorProf'] = [['hvy'], 'cloth'];
    //actorData['traits.ci'] = ; // condition immunity
    //actorData['traits.di'] = ; // damage immunity
    //actorData['traits.dr'] = ; // damage resistance
    //actorData['traits.dv'] = ; // damage vulnerability
    actorData['traits.languages'] = ['Druidic'];
    actorData['traits.weaponProf'] = ['sim', 'longbow'];


    console.log('actorData');
    console.log(actorData);

    // CREATE ACTOR
    // -----------------------------------------------
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
        console.log(actorData);
    }

    
})();

function getAbilityModifier(value) {
    return Math.floor( (value - 10) / 2);
}

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