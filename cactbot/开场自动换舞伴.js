/**
 * 开始倒数的时候，绑定舞伴
 */

Options.Triggers.push({
    zoneId: ZoneId.MatchAll,
    initData: () => {
        return {
            started: false
        };
    },
    triggers: [
        {
            id: "leilei change partner on start",
            regex: Regexes.gameLog({ line: "(Battle commencing in|距离战斗开始还有|戦闘開始まで).+" }),
            condition: (data, matches) => {
                return data.job === "DNC";
            },
            run: (data, matches, output) => {
                if (data.started) {
                    return;
                }

                data.started = true;
                data.leileiFL.doTextCommand(`/ac ${output.技能名字()} <1>`);
                setTimeout(() => {
                    data.leileiFL.doTextCommand(`/ac ${output.技能名字()} <${output.小队列表序号()}>`);
                }, 1500);
            },
            outputStrings: {
                技能名字: "闭式舞姿",
                小队列表序号: "2"
            },
        },
        {
            id: "leilei reset on wipe",
            regex: "^.{14} (?:\w+ )21:.{8}:4000000F|任务结束了。|has ended\.|の攻略を終了した。",
            condition: (data, matches) => {
                return data.job === "DNC";
            },
            run: (data) => {
                data.started = false;
            },
        },
        {
            id: "leilei reset on cancel",
            regex: Regexes.gameLog({ line: ".+?取消了战斗开始倒计时。|.+?により、戦闘開始カウントがキャンセルされました。|Countdown canceled by .+?." }),
            condition: (data, matches) => {
                return data.job === "DNC";
            },
            run: (data) => {
                data.started = false;
            },
        },
    ]
})