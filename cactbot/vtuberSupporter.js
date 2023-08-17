/**
 * 特定目标达成时，调用皮套动作
 */

const send = (path) => {
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

        };
    },
    triggers: [
        {
            id: "vtuberSupporter dead",
            netRegex: NetRegexes.wasDefeated({}),
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            run: (data, matches, output) => {
                send(output.接口());
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
            preRun: (data, matches, output) => {
                send(output.死亡过期接口());
            },
            //延迟一下 防止请求没收到
            delaySeconds:1,
            run: (data, matches, output) => {
                send(output.接口());
            },
            outputStrings: {
                接口: "weakness",
                死亡过期接口: "deadExpired"
            },
        },
        {
            id: "vtuberSupporter weakness expired",
            netRegex: NetRegexes.losesEffect({ effectId: ["2B", "2C"] }),
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            run: (data, matches, output) => {
                send(output.接口());
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
                send(output.接口());
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
            run: (data, matches, output) => {
                send(output.接口());
            },
            outputStrings: {
                接口: "damageDownExpired"
            },
        },
        {
            id: "vtuberSupporter reset",
            regex: /^.{14} (?:\w+ )21:.{8}:4000000F|任务结束了。|has ended\.|の攻略を終了した。/,
            run: (data, matches, output) => {
                send(output.接口());
            },
            outputStrings: {
                接口: "reset"
            },
        },
    ]
})