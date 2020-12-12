Hooks.on("ready", function () {
    console.log("Heromancer | Parsing races");
    console.log(game.dnd5e.config.abilities);

    // GET COMPENDIUMS & INITIALIZE DATA
    // -----------------------------------------------
    // race names are listed for filtering actual Races from Racial Features
    const raceNames = ['Dragonborn', 'Dwarf', 'Elf', 'Gnome', 'Half-Elf', 'Half-Orc', 'Halfling', 'Human', 'Tiefling'];
    const _compendiumRaceFeatures = await game.packs.get("dnd5e.races").getContent();
    const compRaces = _compendiumRaceFeatures.filter(r => raceNames.includes(r.data.name));
    const compRacialFeatures = _compendiumRaceFeatures.filter(r => !(raceNames.includes(r.data.name)));
    const compClasses = await game.packs.get("dnd5e.classes").getContent();
    const compClassFeatures = await game.packs.get("dnd5e.classfeatures").getContent();

    const races = compRaces.forEach(r => {
        const subraceOf;
        const abilities = {
            str: { bonus: 0, save: false },
            dex: { bonus: 0, save: false },
            con: { bonus: 0, save: false },
            int: { bonus: 0, save: false },
            wis: { bonus: 0, save: false },
            cha: { bonus: 0, save: false },
            any: []
        }
        const senses = {
            vision: 0
        }
        const mov = {
            burrow: 0,
            climb: 0,
            fly: 0,
            swim: 0,
            walk: 0,
            units: "ft",
            hover: false
        }
        const prof = {
            skills: { fixed: [], any: [] },
            weapons: { fixed: [], any: [] },
            armors: { fixed: [], any: [] },
            languages: { fixed: [], any: [] },
            tools: { fixed: [], any: [] }
        }
        const dmg = {
            immunities: [],
            resistances: [],
            vulnerabilities: []
        }
        const cond = {
            immunities: [],
            advantages: []
        }

        return { name: r.data.name, race: r, subraceOf: subraceOf, abilities: abilities, senses: senses, mov: mov, prof: prof, dmg: dmg, cond: cond }
    });

    game.dnd5e.config.races = races;
});