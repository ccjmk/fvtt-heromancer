(async ()=> {
    // Get compendiums
    const raceNames = ['Dragonborn', 'Dwarf', 'Elf', 'Gnome', 'Half-Elf', 'Half-Orc', 'Halfling', 'Human', 'Tiefling'];
/*
    let _races = await game.packs.get("dnd5e.races").getContent();
    const races = _races.filter(r => raceNames.includes(r.data.name));
    const racialFeatures = _races.filter(r => !(raceNames.includes(r.data.name)));
    const classes = await game.packs.get("dnd5e.classes").getContent();
    const classFeatures = await game.packs.get("dnd5e.classfeatures").getContent();
    
    console.log('---------- RACES ---------------');
    races.forEach((c,i) => console.log(`${i}: ${c.data.name}`));
    console.log('---------- RACIAL FEATURES ---------------');
    racialFeatures.forEach((c,i) => console.log(`${i}: ${c.data.name}`));
    console.log('---------- CLASSES ---------------');
    classes.forEach((c,i) => console.log(`${i}: ${c.data.name}`));
    console.log('---------- CLASS FEATURES ---------------');
    classFeatures.forEach((c,i) => console.log(`${i}: ${c.data.name}`));
*/
    // Ask basic info
    
    const data = [[`What is your name? : `, `text`], [`What is your race? : `, `text`], [`What is your class? : `, `text`]];
    let [name, raceSelected, classSelected] = await multi_input({ title : `Summon Multi-roll!`, data });
    
    console.log(`Name: ${name}`);
    console.log(`Race: ${raceSelected}`);
    console.log(`Class: ${classSelected}`);
 /*   
    // Create actor
    let actor = await Actor.create({
      name: name,
      type: "character",
      img: "icons/svg/mystery-man.svg",
      folder: null,
      sort: 12000,
      data: {},
      token: {},
      items: [],
      flags: {}
    });
*/

    // Update race and class
    
})();

async function multi_input({title = ``, data = []} = {})
{
    let value = await new Promise((resolve)=> {
    new Dialog({
        title,       
        buttons : {
        Ok : { 
            label : `Ok`, 
            callback : (html) => { 
            let html_values = html.find("input"); 
            resolve(data.map((e,i) => e[1] == "number" ? html_values[i].valueAsNumber : ( e[1] == "checkbox" ? html_values[i].checked : html_values[i].value)));
            }
        }
        },
        content : `<table style="width:100%">${data.map((input, index) => {
        return `<tr>
                    <th style="width:50%">
                    <label>${input[0]}</label>
                    </th>
                    <td style="width:50%">
                    <input type="${input[1]}" name="${index}"/>
                    </td>
                </tr>`;
        }).join(`
        <select name="cars" id="cars">
            <option value="volvo">Volvo</option>
            <option value="saab">Saab</option>
            <option value="mercedes">Mercedes</option>
            <option value="audi">Audi</option>
        </select>
    `)}</table>`
    }).render(true);
    });
    return value;
}