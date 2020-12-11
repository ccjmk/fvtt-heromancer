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


    // ASK BASIC INFO
    // -----------------------------------------------
    const classNames = Array.from(classes.map(c => c.data.name));
    const basicInfo = [[`What is your name? `, `text`], [`What is your race? `, `select`, raceNames], [`What is your class? `, `select`, classNames], [`What is your background? `, `text`], [`What is your alignment? `, `select`, alignments], [`Dry-run? `, `checkbox`]];
    let [name, raceSelected, classSelected, background, alignment, dryRun] = await multi_input({ title: `Choose name, race and class`, data: basicInfo });

    const raceItem = races.find(r => r.data.name === raceSelected);
    const classItem = classes.find(c => c.data.name === classSelected);


    // SELECT STARTING SKILLS
    // -----------------------------------------------
    const skillsToPick = await classes[0].data.data.skills.number;
    const skillChoicesArray = await getClassSkills(classItem);
    const skillChoices = skillChoicesArray.map(s => `${game.dnd5e.config.skills[s]} ;checkbox`).map(s => s.split(';'));
    const selectedSkills = await multi_input({ title: `Choose class skills (${skillsToPick})`, data : skillChoices });
    selectedSkills.forEach((e,i) => e ? (actorData[`skills.${skillChoicesArray[i]}.value`] = 1) : null);


    // ROLL ABILITIES
    // -----------------------------------------------
    let actorAbilities = rollAbilities();
    actorAbilities.forEach((e,i) => (actorData[`abilities.${e[0]}.value`]) = e[1]);

    
    // SET STARTING HP, DETAILS AND TRAITS
    // -----------------------------------------------
    const hitDice = classItem.data.data.hitDice;
    // remove the d from 'dXX' and add the constitution modifier
    const conMod = getAbilityModifier(actorAbilities.filter(a => a[0] == 'con').map(a => a[1]));
    const hp = parseInt(hitDice.substring(1)) + conMod;
    actorData['attributes.hp.value'] = hp;
    actorData['attributes.hp.max'] = hp;

    //knowing the class we can get the saving throws, weapon, armor, language and tool proficiencies
    const saves = getSavingThrows(classItem);
    saves.forEach((e,i) => (actorData[`abilities.${e}.proficient`]) = [1]);
    console.log(`Saving Throws per class: ${saves}`);

    const armorProfs = getArmorProficiencies(classItem);
    console.log(`Basic armor proficiencies per class: ${armorProfs.value}`);
    console.log(`Custom armor proficiencies per class: ${armorProfs.custom}`);

//all commented lines are for WIP testing, should fly later
    actorData['details.race'] = raceItem.data.name;
    actorData['details.background'] = background;
    actorData['details.alignment'] = alignment;
    // damage interactions
    // actorData['traits.ci.value'] = ['blinded']; // condition immunity
    // actorData['traits.di.value'] = ['bludgeoning']; // damage immunity
    // actorData['traits.dr.value'] = ['piercing']; // damage resistance
    // actorData['traits.dv.value'] = ['slashing']; // damage vulnerability
    // proficiencies
    // actorData['traits.languages.value'] = ['gnoll'];
    // actorData['traits.languages.custom'] = 'boomer';
    // actorData['traits.weaponProf.value'] = ['sim'];
    actorData['traits.armorProf.value'] = armorProfs.value;
    actorData['traits.armorProf.custom'] = armorProfs.custom.join(';');
    // actorData['traits.toolProf.value'] = ['thief', 'vehicle'];


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

function rollAbilities() {
    let actorAbilities = [];
    const abilities = Object.keys(game.dnd5e.config.abilities);
    for(let i=0; i<abilities.length; i++) {
        const r = new Roll("4d6kh3").evaluate();
        console.log(`Rolled ${abilities[i]} : ${r.total}`);
        actorAbilities[i] = [abilities[i], r.total];
    }
    return actorAbilities;
}

function getAbilityModifier(value) {
    return Math.floor( (value - 10) / 2);
}

async function getClassSkills(classItem) {
    // workaround for Druid that is currently broken
    if(classItem.data.name.toLowerCase() == 'druid') return ['arc', 'ani', 'ins', 'med', 'nat', 'prc', 'rel', 'sur'];
    return await classItem.data.data.skills.choices;
}

function getArmorProficiencies(classItem) {
    /*
    * Returns an object with two arrays, values and custom, taken from the description of the class item provided
    * Expects the armor proficiencies to be after an 'Armor:' text near the top, separated by a comma and space
    */

    const classDesc = classItem.data.data.description.value;
    const armorStr = classDesc.substring(classDesc.indexOf('Armor:'), classDesc.indexOf('<br>', classDesc.indexOf('Armor:')));

    //if there's stuff between parenthesys, that goes into the customs
    let customProfs = [];
    customProfs.push(armorStr.substring(
        armorStr.lastIndexOf("(") , 
        armorStr.lastIndexOf(")") + 1
    ));
    let armorProfs = armorStr.substring(armorStr.indexOf(';')+1, armorStr.lastIndexOf("(") > -1 ? armorStr.lastIndexOf("(") : armorStr.length).split(',').map(a => a.toLowerCase().trim());

    if(armorProfs.indexOf('all armor') > -1) { // if 'all armor' is found, replace it with... all armor types <3
        armorProfs.splice(armorProfs.indexOf('all armor'), 1);
        armorProfs.push('heavy armor');
        armorProfs.push('medium armor');
        armorProfs.push('light armor');
    }
    const armorKeys = Object.keys(game.dnd5e.config.armorProficiencies);
    let armorProfKeys = armorProfs.flatMap(s => {
        let p = armorKeys.find(key => game.dnd5e.config.armorProficiencies[key].toLowerCase() === s)
        if(!p) {
            customProfs.push(s);
            return [];
        }
        return [p];
    });

    return { value: armorProfKeys, custom: customProfs };
}

function getSavingThrows(classItem) {
    /*
    * Returns an array with both saving throws taken from the description of the class item provided
    * Expects the saving throws to be after a 'Saving Throws:' text near the top, separated by a comma and space
    */

    const classDesc = classItem.data.data.description.value;
    const savesStr = classDesc.substring(classDesc.indexOf('Saving Throws:'), classDesc.indexOf('<br>', classDesc.indexOf('Saving Throws:')))
    const saves = [ savesStr.substring(savesStr.indexOf(';')+1, savesStr.indexOf(',')).trim() , savesStr.substring(savesStr.indexOf(',')+1).trim() ]

    const abilityKeys = Object.keys(game.dnd5e.config.abilities);
    return saves.map(s => abilityKeys.find(key => game.dnd5e.config.abilities[key] === s));
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