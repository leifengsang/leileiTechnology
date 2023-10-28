/**
 * 倒数的时候干一些活
 */

const regex = /距离战斗开始还有(?<time>\d{1,2})秒！.+?/;
Options.Triggers.push({
    zoneId: ZoneId.MatchAll,
    initData: () => {
        return {
            canceled: false
        };
    },
    triggers: [
        {
            id: "leilei countdown start blm",
            netRegex: NetRegexes.gameLog({ line: regex, capture: true }),
            condition: (data, matches) => {
                return data.job === "BLM";
            },
            preRun: (data) => {
                data.canceled = false;
            },
            delaySeconds: (data, matches) => {
                return Math.max(0, parseInt(matches.time) - 27);
            },
            run: (data, matches) => {
                if (!data.canceled) {
                    data.leileiFL.doTextCommand("/ac 激情咏唱");
                }
            },
        },
        {
            id: "leilei countdown start rdm",
            netRegex: NetRegexes.gameLog({ line: regex, capture: true }),
            condition: (data, matches) => {
                return data.job === "RDM";
            },
            preRun: (data) => {
                data.canceled = false;
            },
            delaySeconds: (data, matches, output) => {
                return Math.max(0, parseInt(matches.time) - parseFloat(output.预读时间()));
            },
            run: (data, matches, output) => {
                if (!data.canceled) {
                    data.leileiFL.doTextCommand("/ac " + output.技能名字());
                }
            },
            outputStrings: {
                技能名字: "赤暴风",
                预读时间: "5.0"
            },
        },
        {
            id: "leilei countdown canceled",
            netRegex: NetRegexes.gameLog({ line: /.+?取消了战斗开始倒计时。|.+?により、戦闘開始カウントがキャンセルされました。|Countdown canceled by .+?./ }),
            run: (data) => {
                data.canceled = true;
            },
        },
    ]
})