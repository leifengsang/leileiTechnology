const isRaidEmulator = location.href.includes("raidemulator.html");
function doTextCommand(text) {
    if (text === undefined) console.trace(`text为空`);
    if (isRaidEmulator) {
        console.log("邮差command", text);
    } else {
        callOverlayHandler({ call: "PostNamazu", c: "DoTextCommand", p: text });
    }
}

const jobs = {
    1: { full: "剑术师", single: "剑" },
    2: { full: "格斗家", single: "格" },
    3: { full: "斧术师", single: "斧" },
    4: { full: "枪术师", single: "矛" },
    5: { full: "弓箭手", single: "弓" },
    6: { full: "幻术师", single: "幻" },
    7: { full: "咒术师", single: "咒" },
    19: { full: "骑士", single: "骑" },
    20: { full: "武僧", single: "僧" },
    21: { full: "战士", single: "战" },
    22: { full: "龙骑士", single: "龙" },
    23: { full: "吟游诗人", single: "诗" },
    24: { full: "白魔法师", single: "白" },
    25: { full: "黑魔法师", single: "黑" },
    26: { full: "秘术师", single: "秘" },
    27: { full: "召唤师", single: "召" },
    28: { full: "学者", single: "学" },
    29: { full: "双剑师", single: "双" },
    30: { full: "忍者", single: "忍" },
    31: { full: "机工士", single: "机" },
    32: { full: "暗黑骑士", single: "暗" },
    33: { full: "占星术士", single: "占" },
    34: { full: "武士", single: "侍" },
    35: { full: "赤魔法师", single: "赤" },
    36: { full: "青魔法师", single: "青" },
    37: { full: "绝枪战士", single: "枪" },
    38: { full: "舞者", single: "舞" },
    39: { full: "钐镰客", single: "钐" },
    40: { full: "贤者", single: "贤" },
};

function getJobShortName(job) {
    return jobs[job].single;
}

Options.Triggers.push({
    zoneId: ZoneId.MatchAll,
    triggers: [
        {
            id: "leilei world 1st dnc's macro",
            netRegex: NetRegexes.ability({ id: "3E86" }),
            condition: (data, matches) => {
                //自己对他人释放
                return matches.source === data.me;
            },
            run: (data, matches) => {
                doTextCommand("/p 谁敢向我挑衅，我将终结他的生命！《国一" + getJobShortName(data.party.details.find((p) => p.name === matches.target).job) + "5%伤害》符文已配！")
            }
        }
    ]
})