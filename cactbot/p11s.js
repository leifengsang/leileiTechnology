/**
 * p11s
 */

Options.Triggers.push({
    // zoneId: ZoneId.AnabaseiosTheEleventhCircleSavage,
    zoneRegex: /Anabaseios: The Eleventh Circle \(Savage\)/,
    initData: () => {
        return {
        }
    },
    triggers: [
        {
            id: "leilei p11s 光暗八方",
            //81E6 暗八方
            //81E7 光八方
            netRegex: NetRegexes.startsUsing({ id: ["81E6", "81E7"] }),
            infoText: (data, matches, output) => {
                if (matches.id === "81E6") {
                    return output.暗八方();
                } else {
                    return output.光八方();
                }
            },
            outputStrings: {
                暗八方: "八方，然后二人分摊",
                光八方: "八方，然后四人分摊"
            }
        },
        {
            id: "leilei p11s 光暗连线",
            //87D3 暗连线
            //87D4 光连线
            netRegex: NetRegexes.startsUsing({ id: ["87D3", "87D4"] }),
            infoText: (data, matches, output) => {
                if (matches.id === "87D3") {
                    if (matches.target === data.me) {
                        return output.暗连线();
                    } else {
                        return output.暗非连线();
                    }
                } else {
                    return output.光连线();
                }
            },
            outputStrings: {
                暗非连线: "远离脚下，然后月环二人分摊",
                暗连线: "脚下引导，然后月环二人分摊",
                光连线: "脚下集合，然后钢铁四人分摊"
            }
        },
        {
            id: "leilei p11s 光暗直线",
            //81EE 光直线
            //81EF 暗直线
            netRegex: NetRegexes.startsUsing({ id: ["81EE", "81EF"] }),
            infoText: (data, matches, output) => {
                if (matches.id === "81EE") {
                    return output.光直线();
                } else {
                    return output.暗直线();
                }
            },
            outputStrings: {
                暗直线: "直线AOE，然后进去二人分摊",
                光直线: "直线AOE，然后远离四人分摊"
            }
        },
        {
            id: "leilei p11s 光暗击退",
            //8785 暗击退
            //8786 光击退
            netRegex: NetRegexes.startsUsing({ id: ["8785", "8786"] }),
            infoText: (data, matches, output) => {
                if (matches.id === "8785") {
                    return output.暗击退();
                } else {
                    return output.光击退();
                }
            },
            outputStrings: {
                暗击退: "击退，然后月环二人分摊",
                光击退: "击退，然后钢铁四人分摊"
            }
        },
        {
            id: "leilei p11s 光暗魔法阵",
            //820E 光门魔法阵
            //820D 暗门魔法阵
            //820F 光球魔法阵
            //8210 暗球魔法阵
            netRegex: NetRegexes.startsUsing({ id: ["820E", "820D", "820F", "8210"] }),
            infoText: (data, matches, output) => {
                if (matches.id === "820E") {
                    return output.光门魔法阵();
                } else if (matches.id === "820D") {
                    return output.暗门魔法阵();
                } else if (matches.id === "820F") {
                    return output.光球魔法阵();
                } else if (matches.id === "8210") {
                    return output.暗球魔法阵();
                }
            },
            outputStrings: {
                光门魔法阵: "去找暗门",
                暗门魔法阵: "去找光门",
                光球魔法阵: "去找暗球",
                暗球魔法阵: "去找光球",
            }
        },
        {
            id: "leilei p11s 光暗双重魔法阵",
            //8212 暗双重魔法阵
            //8211 光双重魔法阵
            netRegex: NetRegexes.startsUsing({ id: ["8212", "8211"] }),
            infoText: (data, matches, output) => {
                if (matches.id === "8212") {
                    return output.暗双重魔法阵();
                } else {
                    return output.光双重魔法阵();
                }
            },
            outputStrings: {
                暗双重魔法阵: "去找光",
                光双重魔法阵: "去找暗",
            }
        },
    ]
})