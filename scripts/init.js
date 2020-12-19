(async () => {
    console.log("Heromancer | Starting initialization");

    //  GET COMPENDIUMS & INITIALIZE DATA
    //  -----------------------------------------------
    // race names are listed for filtering actual Races from Racial Features
    const raceNames = ['Dragonborn', 'Dwarf', 'Elf', 'Gnome', 'Half-Elf', 'Half-Orc', 'Halfling', 'Human', 'Tiefling'];
    const _compendiumRaces = await game.packs.get("dnd5e.races").getContent();
    const compRaces = _compendiumRaces.filter(r => raceNames.includes(r.data.name));
    const compRacialFeatures = _compendiumRaces.filter(r => !(raceNames.includes(r.data.name)));
    const compClasses = await game.packs.get("dnd5e.classes").getContent();
    const compClassFeatures = await game.packs.get("dnd5e.classfeatures").getContent();

    //  INITIALIZE RACE DATA
    //  -----------------------------------------------
    console.log("Heromancer | Building races");
    const races = [];

    const dragonborn = await makeRaceConfig(_compendiumRaces, 'Dragonborn');
    dragonborn.abilities.str.bonus = 2;
    dragonborn.abilities.cha.bonus = 1;
    dragonborn.prof.languages.fixed = ['common', 'draconic'];
    races.push(dragonborn);

    const dwarf = await makeRaceConfig(_compendiumRaces, 'Dwarf');
    dwarf.abilities.con.bonus = 2;
    dwarf.mov.walk = 25;
    dwarf.senses.darkvision = 60;
    dwarf.dmg.resistances.fixed = ['poison'];
    dwarf.prof.languages.fixed = ['common', 'dwarvish'];
    dwarf.prof.weapons.from = ['battleaxe', 'handaxe', 'light hammer', 'warhammer'];
    // dwarf gets prof in any of three artisan tools, marking those as custom as artisan tools is too general
    dwarf.prof.tools.from = { number: 1, options: ["smith's tools", "brewer's supplies", "mason's tools"] };
    races.push(dwarf);

    const hill_dwarf = await makeRaceConfig(_compendiumRaces, 'Hill Dwarf');
    hill_dwarf.subraceOf = dwarf;
    hill_dwarf.abilities.wis.bonus = 1;
    hill_dwarf.attributes.hp.bonus = 1;
    races.push(hill_dwarf);

    const elf = await makeRaceConfig(_compendiumRaces, 'Elf');
    elf.abilities.dex.bonus = 2;
    elf.senses.darkvision = 60;
    elf.prof.skills.fixed = ['prc'];
    elf.prof.languages.fixed = ['elvish', 'common'];
    elf.cond.advantages.fixed = ['charmed'];
    races.push(elf);

    const high_elf = await makeRaceConfig(_compendiumRaces, 'High Elf');
    high_elf.subraceOf = elf;
    high_elf.abilities.int.bonus = 1;
    high_elf.prof.weapons.fixed = ['longsword', 'shortsword', 'shortbow', 'longbow'];
    high_elf.prof.languages.any = 1;
    races.push(high_elf);

    const gnome = await makeRaceConfig(_compendiumRaces, 'Gnome');
    gnome.abilities.int.bonus = 2;
    gnome.attributes.size = 'sm';
    gnome.senses.darkvision = 60;
    gnome.mov.walk = 25;
    gnome.prof.languages.fixed = ['common', 'gnomish'];
    races.push(gnome);

    const rock_gnome = await makeRaceConfig(_compendiumRaces, 'Rock Gnome');
    rock_gnome.subraceOf = gnome;
    rock_gnome.abilities.con.bonus = 1;
    rock_gnome.prof.tools.fixed = ["tinker's tools"];
    races.push(rock_gnome);

    const helf = await makeRaceConfig(_compendiumRaces, 'Half-Elf');
    helf.abilities.cha.bonus = 2;
    helf.abilities.any.bonus = [1, 1];
    helf.senses.darkvision = 60;
    helf.cond.advantages.fixed = ['charmed'];
    helf.prof.skills.any = 2;
    helf.prof.languages.fixed = ['elvish', 'common'];
    helf.prof.languages.any = 1;
    races.push(helf);

    const horc = await makeRaceConfig(_compendiumRaces, 'Half-Orc');
    horc.abilities.str.bonus = 2;
    horc.abilities.con.bonus = 1;
    horc.senses.darkvision = 60;
    horc.prof.skills.fixed = ['itm'];
    horc.prof.languages.fixed = ['common', 'orc'];
    races.push(horc);

    const halfling = await makeRaceConfig(_compendiumRaces, 'Halfling');
    halfling.abilities.dex.bonus = 2;
    halfling.attributes.size = 'sm';
    halfling.mov.walk = 25;
    halfling.cond.advantages.fixed = ['charmed'];
    halfling.prof.languages.fixed = ['common', 'halfling'];
    races.push(halfling);

    const lightfoot_halfling = await makeRaceConfig(_compendiumRaces, 'Lightfoot Halfling');
    lightfoot_halfling.subraceOf = halfling;
    lightfoot_halfling.abilities.cha.bonus = 1;
    races.push(lightfoot_halfling);

    const human = await makeRaceConfig(_compendiumRaces, 'Human');
    human.abilities.str.bonus = 1;
    human.abilities.dex.bonus = 1;
    human.abilities.con.bonus = 1;
    human.abilities.int.bonus = 1;
    human.abilities.wis.bonus = 1;
    human.abilities.cha.bonus = 1;
    human.prof.languages.fixed = ['common'];
    human.prof.languages.any = 1;
    races.push(human);

    const tiefling = await makeRaceConfig(_compendiumRaces, 'Tiefling');
    tiefling.abilities.int.bonus = 1;
    tiefling.abilities.cha.bonus = 2;
    tiefling.senses.darkvision = 60;
    tiefling.dmg.resistances = ['fire'];
    tiefling.prof.languages.fixed = ['common', 'infernal'];
    races.push(tiefling);

    console.log(races);
    game.dnd5e.config.races = races;


    //  INITIALIZE CLASS DATA
    //  -----------------------------------------------
    console.log("Heromancer | Building classes");
    const classes = [];

    const barbarian = await makeClassConfig(compClasses, 'Barbarian');
    barbarian.attributes.hitDie = 'd12';
    barbarian.prof.saves = ['str', 'con'];
    barbarian.prof.armor.fixed = ["lgt", "med", "shl"];
    barbarian.prof.weapons.fixed = ['sim', 'mar'];
    barbarian.prof.skills.from = { number: 2, options: ["ani", "ath", "itm", "nat", "prc", "sur"] };
    classes.push(barbarian);

    const bard = await makeClassConfig(compClasses, 'Bard');
    bard.attributes.hitDie = 'd8';
    bard.prof.saves = ['dex', 'cha'];
    bard.prof.armor.fixed = ['lgt'];
    bard.prof.weapons.fixed = ['sim', 'hand crossbows', 'longswords', 'rapiers', 'shortswords'];
    bard.prof.skills.any = 3;
    bard.prof.tools.fixed = ['instrument 1', 'instrument 2', 'instrument 3'];
    classes.push(bard);

    const cleric = await makeClassConfig(compClasses, 'Cleric');
    cleric.attributes.hitDie = 'd8';
    cleric.prof.saves = ['wis', 'cha'];
    cleric.prof.armor.fixed = ["lgt", "med", "shl"];
    cleric.prof.weapons.fixed = ['sim'];
    cleric.prof.skills.from = { number: 2, options: ["his", "ins", "med", "per", "rel"] };
    classes.push(cleric);

    const druid = await makeClassConfig(compClasses, 'Druid');
    druid.attributes.hitDie = 'd8';
    druid.prof.saves = ['int', 'wis'];
    druid.prof.armor.fixed = ["lgt", "med", "shl", '(druids will not wear armor or use shields made of metal)'];
    druid.prof.weapons.fixed = ['clubs', 'daggers', 'darts', 'javelins', 'maces', 'quarterstaffs', 'scimitars', 'sickles', 'slings', 'spears'];
    druid.prof.skills.from = { number: 2, options: ["arc", "ani", "ins", "med", "nat", "prc", "rel", "sur"] };
    druid.prof.tools.fixed = ['herb'];
    classes.push(druid);

    const fighter = await makeClassConfig(compClasses, 'Fighter');
    fighter.attributes.hitDie = 'd10';
    fighter.prof.saves = ['str', 'con'];
    fighter.prof.armor.fixed = ['hvy', "lgt", "med", "shl"];
    fighter.prof.weapons.fixed = ['sim', 'mar'];
    fighter.prof.skills.from = { number: 2, options: ['acr', "ani", "ath", "his", "ins", "itm", "prc", 'sur'] };
    classes.push(fighter);

    const monk = await makeClassConfig(compClasses, 'Monk');
    monk.attributes.hitDie = 'd8';
    monk.prof.saves = ['str', 'dex'];
    monk.prof.weapons.fixed = ['sim', 'shortswords'];
    monk.prof.skills.from = { number: 2, options: ["acr", "ath", "his", "ins", "rel", "ste"] };
    monk.prof.tools.from = { number: 1, options: ['any artisan tool', 'any instrument'] };
    classes.push(monk);

    const paladin = await makeClassConfig(compClasses, 'Paladin');
    paladin.attributes.hitDie = 'd10';
    paladin.prof.saves = ['wis', 'cha'];
    paladin.prof.armor.fixed = ['hvy', "lgt", "med", "shl"];
    paladin.prof.weapons.fixed = ['sim', 'mar'];
    paladin.prof.skills.from = { number: 2, options: ["ath", "ins", "itm", "med", "prc", "rel"] };
    classes.push(paladin);

    const ranger = await makeClassConfig(compClasses, 'Ranger');
    ranger.attributes.hitDie = 'd10';
    ranger.prof.saves = ['str', 'dex'];
    ranger.prof.armor.fixed = ["lgt", "med", "shl"];
    ranger.prof.weapons.fixed = ['sim', 'mar'];
    ranger.prof.skills.from = { number: 3, options: ["ani", "ath", "ins", "inv", "nat", "prc", "ste", "sur"] };
    classes.push(ranger);

    const rogue = await makeClassConfig(compClasses, 'Rogue');
    rogue.attributes.hitDie = 'd8';
    rogue.prof.saves = ['dex', 'int'];
    rogue.prof.armor.fixed = ["lgt", "med", "shl"];
    rogue.prof.weapons.fixed = ['sim', 'hand crossbows', 'longswords', 'rapiers', 'shortswords'];
    rogue.prof.skills.from = { number: 4, options: ["acr", "ath", "dec", "ins", "itm", "inv", "ath", "itm", "nat", "prc", "sur"] };
    rogue.prof.tools.fixed = ['thief'];
    classes.push(rogue);

    const sorcerer = await makeClassConfig(compClasses, 'Sorcerer');
    sorcerer.attributes.hitDie = 'd6';
    sorcerer.prof.saves = ['con', 'cha'];
    sorcerer.prof.weapons.fixed = ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'];
    sorcerer.prof.skills.from = { number: 2, options: ["arc", "dec", "ins", "itm", "per", "rel"] };
    classes.push(sorcerer);

    const warlock = await makeClassConfig(compClasses, 'Warlock');
    warlock.attributes.hitDie = 'd8';
    warlock.prof.saves = ['wis', 'cha'];
    warlock.prof.armor.fixed = ["lgt"];
    warlock.prof.weapons.fixed = ['sim'];
    warlock.prof.skills.from = { number: 2, options: ["ani", "ath", "itm", "nat", "prc", "sur"] };
    classes.push(warlock);

    const wizard = await makeClassConfig(compClasses, 'Wizard');
    wizard.attributes.hitDie = 'd6';
    wizard.prof.saves = ['int', 'wis'];
    wizard.prof.weapons.fixed = ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'];
    wizard.prof.skills.from = { number: 2, options: ["acr", "his", "ins", "inv", "med", "rel"] };
    classes.push(wizard);

    console.log(classes);
    game.dnd5e.config.classes = classes;
})();


const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
};


async function makeClassConfig(compendiumClasses, className) {
    const item = await compendiumClasses.find(c => c.data.name == className);
    const subclassOf = null;
    const attributes = {
        size: 'med', // .. sm / med / lg ...
        hp: { bonus: 0 }, // HP per level
        hitDie: 'd6' // just a default.... just in case.
    }
    const prof = {
        // ["acr", "ani", "arc", "ath", "dec", "his", "ins", "itm", "inv", "med", "nat", "prc", "prf", "per", "rel", "slt", "ste", "sur"]
        skills: { fixed: [], any: 0, from: { number: 0, choices: [] } },
        // ["mar", "sim"]
        weapons: { fixed: [], any: 0, from: [] },
        // ["hvy", "lgt", "med", "shl"]
        armor: { fixed: [], any: 0, from: [] },
        // ["aarakocra", "abyssal", "aquan", "auran", "celestial", "common", "deep", "draconic", "druidic", "dwarvish", "elvish", "giant", "gith", "gnoll", "gnomish", "goblin", "halfling", "ignan", "infernal", "orc", "primordial", "sylvan", "terran", "cant", "undercommon"]
        languages: { fixed: [], any: 0, from: [] },
        // ["art", "disg", "forg", "game", "herb", "music", "navg", "pois", "thief", "vehicle"]
        tools: { fixed: [], any: 0, from: { number: 0, choices: [] } },
        // str, dex, con, int, wis, cha
        saves: []
    };

    // Multiples of items appear repeated, like two handaxes.
    // Generic items like "any simple weapon" should have no ItemRef and the generic name should be something like "sim" for any simple weapon or the like.
    // e.g. (a) a greataxe or (b) any martial melee weapon ===> [['greataxe'], ['mar']]
    // e.g. (a) two handaxes or (b) any simple weapon ===> [['handaxe', 'handaxe'], ['sim']]
    // e.g. An explorer’s pack and four javelins ===> [["explorer's pack", 'javelin', 'javelin', 'javelin', 'javelin']]
    const equipment = [];

    return {
        name: className,
        item: item,
        subclassOf: subclassOf,
        attributes: attributes,
        prof: prof,
        equipment: equipment
    };
}


async function makeRaceConfig(compendiumRaces, raceName) {
    const item = await compendiumRaces.find(r => r.data.name == raceName);
    const subraceOf = null; // race Object
    const abilities = {
        str: { bonus: 0 },
        dex: { bonus: 0 },
        con: { bonus: 0 },
        int: { bonus: 0 },
        wis: { bonus: 0 },
        cha: { bonus: 0 },
        any: { bonus: [] } // [1] for any +1 ; [1, 1] for two +1's like Half-Elf
    }
    const attributes = {
        size: 'med', // .. sm / med / lg ...
        hp: { bonus: 0 } // HP per level
    }
    const senses = {
        darkvision: 0,
        units: "ft",
    }
    const mov = {
        burrow: 0,
        climb: 0,
        fly: 0,
        swim: 0,
        walk: 30, // default
        units: "ft",
        hover: false
    }
    // e.g get Medicine & Animal Handling, plus any one skill, plus one between Persuation, Religion and Stealth
    // { fixed: ['med', 'ani'], any: [1], from: ['per', 'rel', 'ste'] }
    const prof = {
        // ["acr", "ani", "arc", "ath", "dec", "his", "ins", "itm", "inv", "med", "nat", "prc", "prf", "per", "rel", "slt", "ste", "sur"]
        skills: { fixed: [], any: 0, from: { number: 0, choices: [] } },
        // ["mar", "sim"]
        weapons: { fixed: [], any: 0, from: [] },
        // ["hvy", "lgt", "med", "shl"]
        armor: { fixed: [], any: 0, from: [] },
        // ["aarakocra", "abyssal", "aquan", "auran", "celestial", "common", "deep", "draconic", "druidic", "dwarvish", "elvish", "giant", "gith", "gnoll", "gnomish", "goblin", "halfling", "ignan", "infernal", "orc", "primordial", "sylvan", "terran", "cant", "undercommon"]
        languages: { fixed: [], any: 0, from: [] },
        // ["art", "disg", "forg", "game", "herb", "music", "navg", "pois", "thief", "vehicle"]
        tools: { fixed: [], any: 0, from: { number: 0, choices: [] } }
    }
    const dmg = {
        // ["acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "physical", "piercing", "poison", "psychic", "radiant", "slashing", "thunder"]
        immunities: { fixed: [], any: 0, from: [] },
        resistances: { fixed: [], any: 0, from: [] },
        vulnerabilities: { fixed: [], any: 0, from: [] }
    }
    const cond = {
        // ["blinded", "charmed", "deafened", "diseased", "exhaustion", "frightened", "grappled", "incapacitated", "invisible", "paralyzed", "petrified", "poisoned", "prone", "restrained", "stunned", "unconscious"]
        immunities: { fixed: [], any: 0, from: [] },
        advantages: { fixed: [], any: 0, from: [] }
    }

    return {
        name: raceName,
        item: item,
        subraceOf: subraceOf,
        abilities: abilities,
        attributes: attributes,
        senses: senses,
        mov: mov,
        prof: prof,
        dmg: dmg,
        cond: cond
    }
}