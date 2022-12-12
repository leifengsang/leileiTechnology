/**
 * 雷雷科技通用库，所有科技默认通过本类调用通用方法
 * 部分内容是从souma那边嫖过来的（缩）
 * 下面是嫖过来部分的注释
 *  需要使用一个默语宏来录入职业位置确保小队排序正确，优先级为MTSTH1H2D1D2D3D4
 *  宏内容：/e rp set 战/枪/骑/暗/占/白/贤/学/侍/忍/镰/龙/僧/舞/机/诗/黑/召/赤
 *  你必须使用正斜线 "/" 来对他们进行分隔。
 *  你可以使用多种称呼来对应一个职业（可见下方jobConvert）。"武"=武士，"枪"=绝枪，"矛"=枪术（谁带枪术士！？）
 *  你可以不写队伍里没有的职业，但队伍里存在的职业必须都写上。
 *  该值会被保存，重启ACT并不会丢失此设置。
 */

const isRaidEmulator = location.href.includes("raidemulator.html");
const jobConvert = {
    "PLD": "19",
    "骑": "19",
    "骑士": "19",
    "MNK": "20",
    "僧": "20",
    "武僧": "20",
    "WAR": "21",
    "战": "21",
    "战士": "21",
    "DRG": "22",
    "龙": "22",
    "龙骑": "22",
    "龙骑士": "22",
    "BRD": "23",
    "诗": "23",
    "诗人": "23",
    "吟游诗人": "23",
    "WHM": "24",
    "白": "24",
    "白魔": "24",
    "白魔法师": "24",
    "BLM": "25",
    "黑": "25",
    "黑魔": "25",
    "黑魔法师": "25",
    "SMN": "27",
    "召": "27",
    "召唤": "27",
    "召唤师": "27",
    "SCH": "28",
    "学": "28",
    "学者": "28",
    "NIN": "30",
    "忍": "30",
    "忍者": "30",
    "MCH": "31",
    "机": "31",
    "机工": "31",
    "机工士": "31",
    "DK": "32",
    "DRK": "32",
    "暗": "32",
    "暗骑": "32",
    "暗黑骑士": "32",
    "AST": "33",
    "占": "33",
    "占星": "33",
    "占星术士": "33",
    "SAM": "34",
    "侍": "34",
    "武": "34",
    "武士": "34",
    "RDM": "35",
    "赤": "35",
    "赤魔": "35",
    "赤魔法师": "35",
    "GNB": "37",
    "绝": "37",
    "枪": "37",
    "枪刃": "37",
    "绝枪": "37",
    "绝枪战士": "37",
    "DNC": "38",
    "舞": "38",
    "舞者": "38",
    "RPR": "39",
    "镰": "39",
    "钐": "39",
    "镰刀": "39",
    "钐镰": "39",
    "钐镰客": "39",
    "钐镰师": "39",
    "SGE": "40",
    "贤": "40",
    "贤者": "40",
};
const regex = /\s*rp\s*set\s*(?<text>.+)\s*/;
const jobs = {
    1: { full: "剑术师", single: "剑", simple: "剑术" },
    2: { full: "格斗家", single: "格", simple: "格斗" },
    3: { full: "斧术师", single: "斧", simple: "斧术" },
    4: { full: "枪术师", single: "矛", simple: "枪术" },
    5: { full: "弓箭手", single: "弓", simple: "弓箭" },
    6: { full: "幻术师", single: "幻", simple: "幻术" },
    7: { full: "咒术师", single: "咒", simple: "咒术" },
    19: { full: "骑士", single: "骑", simple: "骑士" },
    20: { full: "武僧", single: "僧", simple: "武僧" },
    21: { full: "战士", single: "战", simple: "战士" },
    22: { full: "龙骑士", single: "龙", simple: "龙骑" },
    23: { full: "吟游诗人", single: "诗", simple: "诗人" },
    24: { full: "白魔法师", single: "白", simple: "白魔" },
    25: { full: "黑魔法师", single: "黑", simple: "黑魔" },
    26: { full: "秘术师", single: "秘", simple: "秘术" },
    27: { full: "召唤师", single: "召", simple: "召唤" },
    28: { full: "学者", single: "学", simple: "学者" },
    29: { full: "双剑师", single: "双", simple: "双剑" },
    30: { full: "忍者", single: "忍", simple: "忍者" },
    31: { full: "机工士", single: "机", simple: "机工" },
    32: { full: "暗黑骑士", single: "暗", simple: "DK" },
    33: { full: "占星术士", single: "占", simple: "占星" },
    34: { full: "武士", single: "侍", simple: "武士" },
    35: { full: "赤魔法师", single: "赤", simple: "赤魔" },
    36: { full: "青魔法师", single: "青", simple: "青魔" },
    37: { full: "绝枪战士", single: "枪", simple: "枪刃" },
    38: { full: "舞者", single: "舞", simple: "舞者" },
    39: { full: "钐镰客", single: "镰", simple: "镰刀" },
    40: { full: "贤者", single: "贤", simple: "贤者" },
};

function doTextCommand(text) {
    if (text === undefined) console.trace(`text为空`);
    if (isRaidEmulator) {
        console.log("邮差command", text);
    } else {
        callOverlayHandler({ call: "PostNamazu", c: "DoTextCommand", p: text });
    }
}

function doQueueActions(queue) {
    if (queue === undefined) console.trace(`queue为空`);
    if (isRaidEmulator) {
        console.log("邮差queue", queue);
    } else {
        queue.forEach((v) => {
            if (typeof v.p === "object") v.p = JSON.stringify(v.p);
        });
        callOverlayHandler({ call: "PostNamazu", c: "DoQueueActions", p: JSON.stringify(queue) });
    }
}

function mark(actorID, markType, localOnly = false) {
    if (actorID === undefined) console.trace(`actorID为空`);
    if (markType === undefined) console.trace(`markType为空`);
    if (isRaidEmulator) {
        console.log("邮差mark", actorID, markType);
    } else {
        callOverlayHandler({
            call: "PostNamazu",
            c: "mark",
            p: JSON.stringify({ ActorID: parseInt(actorID, 16), MarkType: markType, localOnly: localOnly }),
        });
    }
}

function clearMark() {
    doQueueActions([
        { c: "DoTextCommand", p: "/mk off <1>", d: 0 },
        { c: "DoTextCommand", p: "/mk off <2>", d: 0 },
        { c: "DoTextCommand", p: "/mk off <3>", d: 0 },
        { c: "DoTextCommand", p: "/mk off <4>", d: 0 },
        { c: "DoTextCommand", p: "/mk off <5>", d: 0 },
        { c: "DoTextCommand", p: "/mk off <6>", d: 0 },
        { c: "DoTextCommand", p: "/mk off <7>", d: 0 },
        { c: "DoTextCommand", p: "/mk off <8>", d: 0 },
    ]);
}

function getNameByHexId(data, hexId) {
    if (data === undefined) console.trace(`data为空`);
    if (hexId === undefined) console.trace(`hexId为空`);
    return data.party.idToName_[hexId.toUpperCase()];
}

function getHexIdByName(data, name) {
    if (data === undefined) console.trace(`data为空`);
    if (name === undefined) console.trace(`name为空`);
    return data.party.details.find((v) => v.name === name).id;
}

function getJobNameByHexId(data, hexId, type = "simple") {
    if (data === undefined) console.trace(`data为空`);
    if (hexId === undefined) console.trace(`hexId为空`);
    return jobs?.[data.party.details.find((v) => v.name === getNameByHexId(data, hexId))?.job]?.[type] ?? "";
}

function getJobNameByName(data, name, type = "simple") {
    if (data === undefined) console.trace(`data为空`);
    if (name === undefined) console.trace(`name为空`);
    return jobs?.[data.party.details.find((v) => v.name === name)?.job]?.[type] ?? "";
}

let sort = JSON.parse(localStorage.getItem("leileiCustomData"))?.sort;
const leileiData = {
    myParty: [],
    targetMakers: {
        attack1: "attack1", // 0
        attack2: "attack2", // 1
        attack3: "attack3", // 2
        attack4: "attack4", // 3
        attack5: "attack5", // 4
        bind1: "bind1", // 5
        bind2: "bind2", // 6
        bind3: "bind3", // 7
        stop1: "stop1", // 8
        stop2: "stop2", // 9
        square: "square", // 10
        circle: "circle", // 11
        cross: "cross", // 12
        triangle: "triangle", // 13
    },
};
let partyUpdateTimer;
function createMyParty(party) {
    if (sort === null || sort === undefined || !sort.includes) {
        doTextCommand("/e 读取sort默认值");
        sort = [
            "21", //战
            "37", //枪
            "32", //暗
            "19", //骑
            "24", //白
            "33", //占
            "40", //贤
            "28", //学
            "20", //僧
            "22", //龙
            "30", //忍
            "34", //侍
            "39", //钐
            "23", //诗
            "31", //机
            "38", //舞
            "25", //黑
            "27", //召
            "35", //赤
            "36", //青
        ];
    }
    const oldLen = Number(leileiData.myParty.length);
    const newLen = Number(party.filter((v) => v.inParty).length);
    leileiData.myParty = party
        .filter((v) => {
            if (!sort.includes(v.job.toString())) doTextCommand(`/e 无法识别：name:${v.name} job:${v.job}`);
            return v.inParty && sort.includes(v.job.toString());
        })
        .sort((a, b) => sort.indexOf(a.job.toString()) - sort.indexOf(b.job.toString()));
    if (newLen >= oldLen && newLen > 0) {
        clearTimeout(partyUpdateTimer);
        partyUpdateTimer = setTimeout(() => {
            doTextCommand("/e 当前规则：" + sort.map((v) => jobs[v].single).join(""));
        }, 2000);
    }
}

Options.Triggers.push({
    zoneId: ZoneId.MatchAll,
    initData: () => {
        return {
            leileiFL: {
                getNameByHexId,
                getHexIdByName,
                getJobNameByHexId,
                getJobNameByName,
                mark,
                doTextCommand,
                clearMark,
            },
            leileiData,
        };
    },
    triggers: [
        {
            id: "leilei 通用职能位置设置",
            netRegex: NetRegexes.echo({ line: regex, capture: true }),
            run: (data, matches) => {
                sort = matches.line
                    .match(regex)
                    .groups.text.split(/[\\/|-]/)
                    .map((v) => jobConvert[v]);
                localStorage.setItem("leileiCustomData", JSON.stringify({ sort }));
                doTextCommand("/e 已设置" + "<se.9>");
                createMyParty(data.party.details);
            },
        },
    ],
});
addOverlayListener("PartyChanged", (e) => createMyParty(e.party));