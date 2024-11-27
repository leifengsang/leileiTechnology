/**
 * 特定目标达成时，调用皮套动作
 */

const send = (data, path) => {
    if(!data.triggerSetConfig.enable){
        return;
    }
    var url = "http://127.0.0.1:2077/api/" + path;
    console.log("访问接口", url);
    var httpRequest = new XMLHttpRequest();
    httpRequest.open("get", url);
    httpRequest.send();
}

Options.Triggers.push({
    zoneId: ZoneId.MatchAll,
    id: "vtuberSupporter",
    initData: () => {
        return {
            weaknessExpiredFlag: false,
            damageDownExpiredFlag: false,
            dead: false,
        };
    },
    config: [
        {
            id: "enable",
            comment: {
                cn: "",
                en: "",
                jp: "",
            },
            name: {
                cn: "开关",
                en: "开关",
                jp: "开关",
            },
            type: "checkbox",
            default: false
        }
    ],
    triggers: [
        {
            id: "vtuberSupporter dead",
            netRegex: NetRegexes.wasDefeated({}),
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            run: (data, matches, output) => {
                data.dead = true;
                send(data, output.接口());
            },
            outputStrings: {
                接口: "dead"
            },
        },
        {
            id: "vtuberSupporter weakness",
            netRegex: NetRegexes.gainsEffect({ effectId: ["2B", "2C"] }),
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            run: (data, matches, output) => {
                data.dead = false;
                //获得了新的黑头buff，把黑头过期flag取消掉
                data.weaknessExpiredFlag = false;
                data.damageDownExpiredFlag = false;

                send(data, output.接口());
            },
            outputStrings: {
                接口: "weakness"
            },
        },
        {
            id: "vtuberSupporter weakness expired",
            netRegex: NetRegexes.losesEffect({ effectId: ["2B", "2C"] }),
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            preRun: (data) => {
                /**
                 * 黑头流程：失去上一个黑头buff -> 获得新的黑头buff
                 * 所以需要延时异步判断
                 */
                data.weaknessExpiredFlag = true;
            },
            delaySeconds0: 0.1,
            run: (data, matches, output) => {
                if (data.weaknessExpiredFlag) {
                    send(data, output.接口());
                }
            },
            outputStrings: {
                接口: "weaknessExpired"
            },
        },
        {
            id: "vtuberSupporter damage down",
            netRegex: NetRegexes.gainsEffect({ effect: ["伤害降低", "ダメージ低下", " Damage Down"] }),
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            run: (data, matches, output) => {
                data.damageDownExpiredFlag = false;
                send(data, output.接口());
            },
            outputStrings: {
                接口: "damageDown"
            },
        },
        {
            id: "vtuberSupporter damage down expired",
            netRegex: NetRegexes.losesEffect({ effect: ["伤害降低", "ダメージ低下", " Damage Down"] }),
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            preRun: (data) => {
                /**
                 * 伤害降低流程：失去上一个伤害降低buff -> 获得新的伤害降低buff
                 * 所以需要延时异步判断
                 */
                data.damageDownExpiredFlag = true;
            },
            delaySeconds: 0.1,
            run: (data, matches, output) => {
                if (data.damageDownExpiredFlag) {
                    send(data, output.接口());
                }
            },
            outputStrings: {
                接口: "damageDownExpired"
            },
        },
        {
            id: "vtuberSupporter reset",
            regex: /^.{14} (?:\w+ )21:.{8}:4000000F|任务结束了。|has ended\.|の攻略を終了した。/,
            run: (data, matches, output) => {
                send(data, output.接口());
            },
            outputStrings: {
                接口: "reset"
            },
        },
        {
            id: "vtuberSupporter dead expired",
            regex: /(?<timestamp>^.{14}) UpdateHp (?<type>27):(?<id>[^:]*):(?<name>[^:]*):(?<currentHp>[^:]*):(?<maxHp>[^:]*):(?<currentMp>[^:]*):(?<maxMp>[^:]*)(?::[^:]*){2}:(?<x>[^:]*):(?<y>[^:]*):(?<z>[^:]*):(?<heading>[^:]*)(?:$|:)/,
            condition: (data, matches) => {
                return data.dead && matches.name === data.me && parseInt(matches.currentHp) > 0;
            },
            run: (data, matches, output) => {
                //死了，被LB拉起来等没有黑头的情况，手动调用一下
                data.dead = false;
                send(data, output.接口());
            },
            outputStrings: {
                接口: "deadExpired"
            },
        },
    ]
})