/**
 * 绑定舞伴的时候，喊一个lol式符文配置成功
 */

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
            run: (data, matches, output) => {
                data.leileiFL.doTextCommand(output.content({ name: matches.target, job: data.leileiFL.getJobNameByHexId(data, matches.targetId, "single") }));
            },
            outputStrings: {
                content: "/p 谁敢向我挑衅，我将终结他的生命！《${name}国一${job}5%伤害》符文已配！"
            },
        }
    ]
})