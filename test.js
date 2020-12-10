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
    
    const data = [[`What is your name? `, `text`], [`What is your race? `, `select`, raceNames], [`What is your class? `, `select`, Array.from(classes.map(c => c.data.name))]];
    let [name, raceSelected, classSelected] = await multi_input({ title : `Summon Multi-roll!`, data });
    
    console.log(`Creating..
    Name: ${name}
    Race: ${raceSelected}
    Class: ${classSelected}
    `);

    const raceItem = races.find(r => r.data.name === raceSelected);
    const classItem = classes.find(c => c.data.name === classSelected);

    console.log(raceItem)
    console.log(classItem)
    
    // Create actor
    let actor = await Actor.create({
      name: name,
      type: "character",
      img: "icons/svg/mystery-man.svg",
      folder: null,
      sort: 12000,
      data: {},
      token: {},
      items: [raceItem, classItem],
      flags: {}
    });


    // Update race and class
    
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
                console.log(selects);
                let html_values = html.find("input");
                console.log(html_values)
                resolve(data.map((e,i) => {
                    console.log("e")
                    console.log(e)
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