/**
 * 绑定舞伴的时候，喊一个lol式符文配置成功
 */

Options.Triggers.push({
    zoneId: ZoneId.MatchAll,
    triggers: [
        {
            id: "leilei world 1st dnc's macro",
            netRegex: NetRegexes.ability({ id: "3E86" }),
            condition: (data, matches, output) => {
                if(output.enable !== "true"){
                    return false;
                }

                //自己对他人释放
                return matches.source === data.me;
            },
            run: (data, matches) => {
                doTextCommand("/p 谁敢向我挑衅，我将终结他的生命！" + matches.target
                    + "《国一" + data.leileiFL.getJobNameByName(data, matches.target, "single") + "5%伤害》符文已配！")
            },
            outputStrings: {
                enable: true
            },
        }
    ]
})