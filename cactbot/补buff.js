/**
 * 各种补buff
 */

Options.Triggers.push({
    zoneId: ZoneId.MatchAll,
    initData: () => {
        return {
        };
    },
    triggers: [
        {
            id: "leilei 补buff 镰刀-死亡烙印",
            netRegex: NetRegexes.gainsEffect({ effectId: "A1A" }),
            condition: (data, matches) => {
                return matches.source === data.me;
            },
            delaySeconds: (data, matches) => {
                return parseInt(matches.duration) - 5;
            },
            infoText: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                content: "补buff",
            }
        },
        {
            id: "leilei 补buff 诗人-风dot",
            netRegex: NetRegexes.gainsEffect({ effectId: "4B1" }),
            condition: (data, matches) => {
                return matches.source === data.me;
            },
            delaySeconds: (data, matches) => {
                return parseInt(matches.duration) - 5;
            },
            infoText: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                content: "补buff",
            }
        },
        {
            id: "leilei 补buff 诗人-毒dot",
            netRegex: NetRegexes.gainsEffect({ effectId: "4B0" }),
            condition: (data, matches) => {
                return matches.source === data.me;
            },
            delaySeconds: (data, matches) => {
                return parseInt(matches.duration) - 5;
            },
            infoText: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                content: "补buff",
            }
        },
    ]
})