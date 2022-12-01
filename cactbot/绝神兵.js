Options.Triggers.push({
    zoneId: ZoneId.TheWeaponsRefrainUltimate,
    triggers: [
        {
            id: "leilei 大怒震",
            netRegex: NetRegexes.startsUsing({ id: "2B67" }),
            run: (data) => {
                data.markCount = 0; //石牢点名count
            }
        },
        {
            id: "leilei 石牢点名",
            netRegex: NetRegexes.ability({ id: "2B6[BC]" }),
            run: (data, matches) => {
                //大怒震后的前三个石牢点名为三连桶点名
                if (data.markCount < 3) {
                    //TODO 等custom库先写完吧

                    data.markCount++;
                }
            }
        }
    ]
})