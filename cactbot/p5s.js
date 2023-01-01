/**
 * p5s 前后刀 分摊分散
 */

Options.Triggers.push({
    zoneId: ZoneId.AbyssosTheFifthCircleSavage,
    triggers: [
        {
            id: "leilei p5s 前后刀",
            netRegex: NetRegexes.startsUsing({ id: ["7712", "770E"] }),
            tts: (data, matches, output) => {
                let content = "";
                if (matches.id === "7712") {
                    content = output.先前再后();
                } else {
                    content = output.先后再前();
                }

                return content;
            },
            outputStrings: {
                先前再后: "先去前面",
                先后再前: "先去后面",
            }
        },
        {
            id: "leilei p5s 分摊分散",
            netRegex: NetRegexes.startsUsing({ id: ["7717", "7716"] }),
            tts: (data, matches, output) => {
                let content = "";
                if (matches.id === "7717") {
                    content = output.先分摊后分散();
                } else {
                    content = output.先分散后分摊();
                }

                return content;
            },
            outputStrings: {
                先分摊后分散: "分摊分摊",
                先分散后分摊: "分散分散",
            }
        }
    ]
})