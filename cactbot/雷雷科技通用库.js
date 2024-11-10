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

const ITEM_RP_DEBUG = "leileiRpDebug";

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
    "VPR": "41",
    "蛇": "41",
    "蝰蛇": "41",
    "蝰蛇剑士": "41",
    "PCT": "42",
    "画": "42",
    "画家": "42",
    "绘灵法师": "42",
};
const regex = /\s*rp\s*set\s*(?<text>.+)\s*/;
const regex2 = /\s*rp\s*manual\s*set\s*(?<rp>.+?)[:：]\s*(?<player>.+)/;
const rpDebugRegex = /\s*rp\s*debug\s*(?<text>.+)\s*/;
const jobs = {
    1: { full: "剑术师", single: "剑", simple: "剑术", code: "" },
    2: { full: "格斗家", single: "格", simple: "格斗", code: "" },
    3: { full: "斧术师", single: "斧", simple: "斧术", code: "" },
    4: { full: "枪术师", single: "矛", simple: "枪术", code: "" },
    5: { full: "弓箭手", single: "弓", simple: "弓箭", code: "" },
    6: { full: "幻术师", single: "幻", simple: "幻术", code: "" },
    7: { full: "咒术师", single: "咒", simple: "咒术", code: "" },
    19: { full: "骑士", single: "骑", simple: "骑士", code: "PLD" },
    20: { full: "武僧", single: "僧", simple: "武僧", code: "MNK" },
    21: { full: "战士", single: "战", simple: "战士", code: "WAR" },
    22: { full: "龙骑士", single: "龙", simple: "龙骑", code: "DRG" },
    23: { full: "吟游诗人", single: "诗", simple: "诗人", code: "BRD" },
    24: { full: "白魔法师", single: "白", simple: "白魔", code: "WHM" },
    25: { full: "黑魔法师", single: "黑", simple: "黑魔", code: "BLM" },
    26: { full: "秘术师", single: "秘", simple: "秘术", code: "" },
    27: { full: "召唤师", single: "召", simple: "召唤", code: "SMN" },
    28: { full: "学者", single: "学", simple: "学者", code: "SCH" },
    29: { full: "双剑师", single: "双", simple: "双剑", code: "" },
    30: { full: "忍者", single: "忍", simple: "忍者", code: "NIN" },
    31: { full: "机工士", single: "机", simple: "机工", code: "MCH" },
    32: { full: "暗黑骑士", single: "暗", simple: "DK", code: "DRK" },
    33: { full: "占星术士", single: "占", simple: "占星", code: "AST" },
    34: { full: "武士", single: "侍", simple: "武士", code: "SAM" },
    35: { full: "赤魔法师", single: "赤", simple: "赤魔", code: "RDM" },
    36: { full: "青魔法师", single: "青", simple: "青魔", code: "" },
    37: { full: "绝枪战士", single: "枪", simple: "枪刃", code: "GNB" },
    38: { full: "舞者", single: "舞", simple: "舞者", code: "DNC" },
    39: { full: "钐镰客", single: "镰", simple: "镰刀", code: "RPR" },
    40: { full: "贤者", single: "贤", simple: "贤者", code: "SGE" },
    41: { full: "蝰蛇剑士", single: "蛇", simple: "蝰蛇", code: "VPR" },
    42: { full: "绘灵法师", single: "画", simple: "画家", code: "PCT" },
};
const tCall = ["MT", "ST", "T3", "T4", "T5", "T6", "T7", "T8"];
const hCall = ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8"];
const dCall = ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8"];

const role = {
    tank: [1, 3, 19, 21, 32, 37],
    healer: [6, 24, 28, 33, 40],
    dps: [2, 4, 5, 7, 20, 22, 23, 25, 26, 27, 29, 30, 31, 34, 35, 36, 38, 39, 41, 42],
};

function setRP(tarName, tarRP) {
    const tar = leileiData.myParty.find((v) => v.name === tarName);
    const repeat = leileiData.myParty.find((v) => v.myRP === tarRP);
    if (!tar) doTextCommand(`/e 未找到${tarName} <se.11>`);
    else {
        if (repeat && repeat.name !== tar.name) {
            repeat.myRP = tar.myRP;
            doTextCommand(`/e 由于位置冲突,${repeat.name}自動改為${repeat.myRP}`);
        }
        tar.myRP = tarRP;
        doTextCommand(`/e 已設置${tarName}為${tarRP}`);
    }
}

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
    if (leileiData.myParty.length === 0) createMyParty(data.party.details);
    return data.party.idToName_[hexId.toUpperCase()];
}

function getHexIdByName(data, name) {
    if (data === undefined) console.trace(`data为空`);
    if (name === undefined) console.trace(`name为空`);
    if (leileiData.myParty.length === 0) createMyParty(data.party.details);
    return data.party.details.find((v) => v.name === name).id;
}

function getJobNameByHexId(data, hexId, type = "simple") {
    if (data === undefined) console.trace(`data为空`);
    if (hexId === undefined) console.trace(`hexId为空`);
    if (leileiData.myParty.length === 0) createMyParty(data.party.details);
    return jobs?.[data.party.details.find((v) => v.name === getNameByHexId(data, hexId))?.job]?.[type] ?? "";
}

function getJobNameByName(data, name, type = "simple") {
    if (data === undefined) console.trace(`data为空`);
    if (name === undefined) console.trace(`name为空`);
    if (leileiData.myParty.length === 0) createMyParty(data.party.details);
    return jobs?.[data.party.details.find((v) => v.name === name)?.job]?.[type] ?? "";
}

function getJobPriority(job) {
    return sort?.indexOf(job.toString());
}

function getRoleByName(data, name) {
    if (data === undefined) console.trace(`data为空`);
    if (name === undefined) console.trace(`name为空`);
    if (leileiData.myParty.length === 0) createMyParty(data.party.details);
    return data.party.nameToRole_[name];
}

function getRoleById(data, hexId) {
    if (data === undefined) console.trace(`data为空`);
    if (hexId === undefined) console.trace(`hexId为空`);
    if (leileiData.myParty.length === 0) createMyParty(data.party.details);
    return getRoleByName(data, getNameByHexId(data, hexId));
}

function getRpByName(data, name) {
    if (data === undefined) console.trace(`data为空`);
    if (name === undefined) console.trace(`name为空`);
    if (leileiData.myParty.length === 0) createMyParty(data.party.details);
    return leileiData.myParty.find((v) => v.name === name)?.myRP;
}

function getRpByHexId(data, hexId) {
    if (data === undefined) console.trace(`data为空`);
    if (hexId === undefined) console.trace(`hexId为空`);
    if (leileiData.myParty.length === 0) createMyParty(data.party.details);
    return getRpByName(data, getNameByHexId(data, hexId));
}

function getNameByRp(data, rp) {
    if (data === undefined) console.trace(`data为空`);
    if (rp === undefined) console.trace(`rp为空`);
    if (leileiData.myParty.length === 0) createMyParty(data.party.details);
    return leileiData.myParty.find((v) => v.myRP === rp)?.name;
}

function getHexIdByRp(data, rp) {
    if (data === undefined) console.trace(`data为空`);
    if (rp === undefined) console.trace(`rp为空`);
    if (leileiData.myParty.length === 0) createMyParty(data.party.details);
    return data.party.partyIds_[data.party.partyNames_.indexOf(getNameByRp(data, rp))];
}

function isRanged(rp) {
    if (rp === undefined) console.trace(`rp为空`);
    return ["H1", "H2", "D3", "D4"].includes(rp);
}

function isRPExists(data, rp) {
    data.party.partyIds_.forEach((v) => {
        if (rp === getRpByHexId(data, v)) {
            return true;
        }
    });
    return false;
}

let sort = JSON.parse(localStorage.getItem("leileiCustomData"))?.sort;
const leileiData = {
    myParty: [],
    targetMarkers: {
        attack1: "attack1", // 1
        attack2: "attack2", // 2
        attack3: "attack3", // 3
        attack4: "attack4", // 4
        attack5: "attack5", // 5
        bind1: "bind1", // 6
        bind2: "bind2", // 7
        bind3: "bind3", // 8
        stop1: "stop1", // 9
        stop2: "stop2", // 10
        square: "square", // 11
        circle: "circle", // 12
        cross: "cross", // 13
        triangle: "triangle", // 14
        attack6: "attack6", // 15
        attack7: "attack7", // 16
        attack8: "attack8", // 17
    },
};
let partyUpdateTimer;
function createMyParty(party) {
    const debug = isRpDebugOpen();
    if (sort === null || sort === undefined || !sort.includes) {
        if (debug) {
            doTextCommand("/e get default sort rule");
        }
        sort = [
            "34", //侍
            "20", //僧
            "39", //钐
            "22", //龙
            "30", //忍
            "41", //蛇
            "32", //暗
            "37", //枪
            "21", //战
            "19", //骑
            "23", //诗
            "31", //机
            "38", //舞
            "25", //黑
            "35", //赤
            "27", //召
            "42", //画
            "36", //青
            "24", //白
            "33", //占
            "28", //学
            "40", //贤
        ];
    }
    const oldLen = Number(leileiData.myParty.length);
    const newLen = Number(party.filter((v) => v.inParty).length);

    leileiData.myParty = party
        .filter((v) => {
            if (!sort.includes(v.job.toString())) {
                if (debug) {
                    doTextCommand(`/e get sort rule failed. name:${v.name} job:${v.job}`);
                }
            };
            return v.inParty && sort.includes(v.job.toString());
        })
        .sort((a, b) => sort.indexOf(a.job.toString()) - sort.indexOf(b.job.toString()));

    let t = 0;
    let h = 0;
    let d = 0;
    leileiData.myParty.forEach((v) => {
        if (role.tank.includes(Number(v.job))) v.myRP = tCall[t++];
        else if (role.healer.includes(Number(v.job))) v.myRP = hCall[h++];
        else if (role.dps.includes(Number(v.job))) v.myRP = dCall[d++];
        else v.myRP = "unknown";
    });

    if (newLen >= oldLen && newLen > 0) {
        clearTimeout(partyUpdateTimer);
        partyUpdateTimer = setTimeout(() => {
            if (debug) {
                doTextCommand("/e current sort rule:" + sort.map((v) => jobs[v].code).join("/"));
                doQueueActions(leileiData.myParty.map((v) => {
                    return { c: "DoTextCommand", p: `/e ${v.myRP} ${jobs[v.job].code} ${v.name}`, d: 10 };
                }));
            }
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
                getJobPriority,
                getRoleByName,
                getRoleById,
                getRpByName,
                getRpByHexId,
                getNameByRp,
                getHexIdByRp,
                isRanged,
                isRPExists,
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
                doTextCommand("/e 已設置" + "<se.9>");
                createMyParty(data.party.details);
            },
        },
        {
            id: "leilei 通用职能位置设置 手动默语宏修正",
            netRegex: NetRegexes.echo({ line: regex2, capture: true }),
            run: (_data, matches) => {
                const r = matches.line.match(regex2);
                setRP(r.groups.player.trim(), r.groups.rp.toUpperCase());
            },
        },
        {
            id: "leilei 输出职能日志",
            netRegex: NetRegexes.echo({ line: rpDebugRegex, capture: true }),
            run: (_data, matches) => {
                const text = matches.line.match(rpDebugRegex).groups.text;
                localStorage.setItem(ITEM_RP_DEBUG, text);
                doTextCommand("/e 输出rpDebug日志：" + isRpDebugOpen() + "<se.9>");
            },
        },
    ],
});

function isRpDebugOpen() {
    const text = localStorage.getItem(ITEM_RP_DEBUG);
    return text ? text.toLowerCase() == "true" : false;
}

addOverlayListener("PartyChanged", (e) => createMyParty(e.party));