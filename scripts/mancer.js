(async () => {
    let actorData = {}; // used for proficiencies, languages, hp, etc..
    const races = game.dnd5e.config.races;
    const classes = game.dnd5e.config.classes;


    // BASIC INFO
    // -----------------------------------------------
    const abilityGeneration = ['Roll stats in order'];
    const basicInfo = [
        [`How to define abilities? `, `select`, abilityGeneration],
        [`What is your name? `, `text`],
        [`What is your race? `, `select`, races.filter(r => r.subraceOf === null).map(r => r.name)],
        [`What is your class? `, `select`, classes.filter(c => c.subclassOf === null).map(c => c.name)],
        [`What is your background? `, `text`],
        [`What is your alignment? `, `select`, Object.values(game.dnd5e.config.alignments)],
        [`Dry-run? `, `checkbox`]
    ];
    let [stats, name, raceSelected, classSelected, background, alignmentSelected, dryRun] = await multi_input({ title: `Choose starting info`, data: basicInfo });
    const heroRace = races.find(r => r.name === raceSelected);
    const heroClass = classes.find(c => c.name === classSelected);
    const heroAlignment = Object.entries(game.dnd5e.config.alignments).find(a => a[1] === alignmentSelected)[0];


    // ROLL ABILITIES
    // -----------------------------------------------
    let actorAbilities;
    switch (stats) {
        case 'Roll stats in order':
            actorAbilities = rollAbilities();
            break;
    }
    actorAbilities.forEach((e, i) => actorData[`abilities.${e[0]}.value`] = e[1] + heroRace.abilities[e[0]].bonus);


    // SET STARTING HP, DETAILS AND TRAITS
    // -----------------------------------------------
    // remove the d from 'dXX' and add the constitution modifier
    const conMod = getAbilityModifier(actorAbilities.filter(a => a[0] == 'con').map(a => a[1]));
    const hp = parseInt(heroClass.attributes.hitDie.substring(1)) + conMod + heroRace.attributes.hp.bonus;
    actorData['attributes.hp.value'] = hp;
    actorData['attributes.hp.max'] = hp;

    actorData['details.race'] = heroRace.name;
    actorData['details.background'] = background;
    actorData['details.alignment'] = await game.dnd5e.config.alignments[heroAlignment];
    actorData['traits.size'] = `${heroRace.attributes.size}`
    if(heroRace.senses.darkvision > 0) {
        actorData['traits.senses'] = `Darkvision: ${heroRace.senses.darkvision}${heroRace.senses.units}`
    }

    // damage interactions
    // actorData['traits.ci.value'] = ['blinded']; // condition immunity
    // actorData['traits.di.value'] = ['bludgeoning']; // damage immunity
    // actorData['traits.dr.value'] = ['piercing']; // damage resistance
    // actorData['traits.dv.value'] = ['slashing']; // damage vulnerability

    //  PROFICIENCIES
    //  -----------------------------------------------
    heroClass.prof.saves.forEach((e, i) => (actorData[`abilities.${e}.proficient`]) = [1]);

    let skillProficiencies = await getSkillProficiencies(heroRace, heroClass);
    skillProficiencies.forEach((e, i) => e ? (actorData[`skills.${heroClass.prof.skills.from.options[i]}.value`] = 1) : null);

    let armorProficiencies = await getArmorProficiencies(heroRace, heroClass);
    actorData['traits.armorProf.value'] = armorProficiencies.standard;
    actorData['traits.armorProf.custom'] = armorProficiencies.custom.join(';');

    let weaponProficiencies = await getWeaponProficiencies(heroRace, heroClass);
    actorData['traits.weaponProf.value'] = weaponProficiencies.standard;
    actorData['traits.weaponProf.custom'] = weaponProficiencies.custom.join(';');

    let toolProficiencies = await getToolProficiencies(heroRace, heroClass);
    actorData['traits.toolProf.value'] = toolProficiencies.standard;
    actorData['traits.toolProf.custom'] = toolProficiencies.custom.join(';');

    let languageProficiencies = await getLanguageProficiencies(heroRace, heroClass);
    actorData['traits.languages.value'] = languageProficiencies.standard;
    actorData['traits.languages.custom'] = languageProficiencies.custom.join(';');

    console.log(actorData);

    // CREATE ACTOR
    // -----------------------------------------------
    let actor;
    if (!dryRun) {
        // Create actor
        console.log(`Creating ${name} (${raceSelected} ${classSelected})`);

        actor = await Actor.create({
            name: name,
            type: "character",
            img: "icons/svg/mystery-man.svg",
            folder: null,
            sort: 12000,
            data: actorData,
            token: {},
            items: [heroRace.item, heroClass.item],
            flags: {}
        });
    } else {
        console.log("> DRY-RUN: ");
        console.log(`Name: ${name}`);
        console.log(`Race: ${raceItem.data.name}`);
        console.log(`Class: ${classItem.data.name}`);
        console.log(`Skills: ${selectedSkills.map((s, i) => s ? skillChoicesArray[i] : false).filter(s => s)}`);
        console.log(actorData);
    }
})();

function rollAbilities() {
    let actorAbilities = [];
    const abilities = Object.keys(game.dnd5e.config.abilities);
    for (let i = 0; i < abilities.length; i++) {
        const r = new Roll("4d6kh3").evaluate();
        console.log(`Rolled ${abilities[i]} : ${r.total}`);
        actorAbilities[i] = [abilities[i], r.total];
    }
    return actorAbilities;
}

async function getSkillProficiencies(heroRace, heroClass) {
    let proficientSkills = [...new Set(heroRace.prof.skills.fixed.concat(heroClass.prof.skills.fixed))]; //add all (distinct) fixed skills from race and class
    if (heroRace.prof.skills.from.number > 0) { // then ask between reimaining race options
        const skillsToPick = heroRace.prof.skills.from.options.filter(s => !proficientSkills.includes(s));
        const selectedSkills = await multi_input({ title: `Choose race skills (${heroRace.prof.skills.from.number})`, data: skillsToPick.map(s => `${game.dnd5e.config.skills[s]} ;checkbox`).map(s => s.split(';')) });
        proficientSkills = proficientSkills.concat(selectedSkills);
    }
    if (heroClass.prof.skills.from.number > 0) { // then between reimaining class options
        const skillsToPick = heroClass.prof.skills.from.options.filter(s => !proficientSkills.includes(s));
        const selectedSkills = await multi_input({ title: `Choose class skills (${heroClass.prof.skills.from.number})`, data: skillsToPick.map(s => `${game.dnd5e.config.skills[s]} ;checkbox`).map(s => s.split(';')) });
        proficientSkills = proficientSkills.concat(selectedSkills);
    }
    return proficientSkills;
}

function getProficiencies(heroRace, heroClass, profType, profKeys) {
    // add all (distinct) armor proficiencies from race and class
    let proficiencies = [...new Set(heroRace.prof[profType].fixed.concat(heroClass.prof[profType].fixed))];
    let custom = [];

    // move anything non-standard to custom and clean "none"
    let standard = proficiencies.flatMap(s => {
        if (s.toLowerCase() == 'none') return [];
        let p = profKeys.find(key => key === s)
        if (!p) {
            custom.push(capitalize(s));
            return [];
        }
        return [p];
    });

    return { standard: standard, custom: custom };
}

function getArmorProficiencies(heroRace, heroClass) {
    return getProficiencies(heroRace, heroClass, 'armor', Object.keys(game.dnd5e.config.armorProficiencies));
}

function getWeaponProficiencies(heroRace, heroClass) {
    return getProficiencies(heroRace, heroClass, 'weapons', Object.keys(game.dnd5e.config.weaponProficiencies));
}

function getLanguageProficiencies(heroRace, heroClass) {
    return getProficiencies(heroRace, heroClass, 'languages', Object.keys(game.dnd5e.config.languages));
}

async function getToolProficiencies(heroRace, heroClass) {
    const profKeys = Object.keys(game.dnd5e.config.toolProficiencies);
    let proficiencies = getProficiencies(heroRace, heroClass, 'tools', profKeys);
    if (heroRace.prof.tools.from.number > 0) { // then ask between reimaining race options
        const toolsToPick = heroRace.prof.tools.from.options.filter(s => !proficiencyInList(proficiencies, s));
        const selectedTools = await multi_input({ title: `Choose race tools (${heroRace.prof.tools.from.number})`, data: toolsToPick.map(s => `${game.dnd5e.config.skills[s] || s} ;checkbox`).map(s => s.split(';')) });
        selectedTools.forEach((e,i) => {
            if(e) {
                let p = toolsToPick[i];
                if(profKeys.includes(p))
                    proficiencies.standard = proficiencies.standard.concat(p);
                else
                    proficiencies.custom = proficiencies.custom.concat(capitalize(p));
            }
        });
    }
    if (heroClass.prof.tools.from.number > 0) { // then between reimaining class options
        const toolsToPick = heroClass.prof.tools.from.options.filter(s => !proficiencyInList(proficiencies, s));
        const selectedTools = await multi_input({ title: `Choose class tools (${heroClass.prof.tools.from.number})`, data: toolsToPick.map(s => `${game.dnd5e.config.skills[s] || s} ;checkbox`).map(s => s.split(';')) });
        selectedTools.forEach((e,i) => {
            if(e) {
                let p = toolsToPick[i];
                if(profKeys.includes(p))
                    proficiencies.standard = proficiencies.standard.concat(p);
                else
                    proficiencies.custom = proficiencies.custom.concat(capitalize(p));
            }
        });
    }

    return proficiencies;
}

function proficiencyInList(proficiencies, prof) {
    return proficiencies.standard.includes(prof) || proficiencies.custom.includes(prof);
}

const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}

function getAbilityModifier(value) {
    return Math.floor((value - 10) / 2);
}

async function multi_input({ title = ``, data = [] } = {}) {
    /*
    * Based on multi_input from (pending confirmation) @Kekilla
    * 
    * Expects an array of data objects each with the form [label, type (, [select options])], corresponding to each item to request
    * Type can be text, number, checkbox or select.
    * 
    * If type is select, a 3rd value containing the list of options needs to be provided, 
    * which will be used both as value and as text for the select
    */

    let value = await new Promise((resolve) => {
        new Dialog({
            title,
            buttons: {
                Ok: {
                    label: `Ok`,
                    callback: (html) => {
                        let selects = html.find("select");
                        let html_values = html.find("input");
                        resolve(data.map((e, i) => {
                            switch (e[1]) {
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
            content: `<table style="width:100%">${data.map((input, index) => {
                if (input[1] === 'select') {
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