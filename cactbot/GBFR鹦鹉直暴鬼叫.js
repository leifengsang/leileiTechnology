/**
 * 配置的指定技能直/暴时，鬼叫すごい；直暴时，鬼叫アンビリーバボ—
 */

const getDelaySeconds = (groupList, target) => {
    const valueWeight = groupList.split(",").find((v) => {
        return v.split("#")[0] === target;
    });

    if (typeof (valueWeight) === "undefined") {
        return 0;
    }

    return parseFloat(valueWeight.split("#")[1]);
}

Options.Triggers.push({
    zoneId: ZoneId.MatchAll,
    id: "leilei GBFR parrot shouting",
    config: [
        {
            id: "ability_test_enable",
            comment: {
                cn: "开启后，在raidboss悬浮窗控制台输出技能id"
            },
            name: {
                cn: "开启调试模式"
            },
            type: "checkbox",
            default: false
        },
        {
            id: "C_or_D_audio_url",
            comment: {
                cn: "音频路径：ui/raidboss/文件夹的相对路径"
            },
            name: {
                cn: "直or暴音频路径"
            },
            type: "string",
            default: "../../user/raidboss/sugoi.mp3"
        },
        {
            id: "C_and_D_audio_url",
            comment: {
                cn: "音频路径：ui/raidboss/文件夹的相对路径"
            },
            name: {
                cn: "直暴音频路径"
            },
            type: "string",
            default: "../../user/raidboss/unbelievable.mp3"
        },
        {
            id: "skill_list",
            comment: {
                cn: "技能id列表#号分隔，如：1D65#1D66#4092#6502"
            },
            name: {
                cn: "技能id列表"
            },
            type: "string",
            default: "1D65#1D66#4092#6502"
        },
        {
            id: "skill_delay_list",
            comment: {
                cn: "有的技能伤害数字出来比较慢，声音延后放可能效果会更好<br>" +
                    "配置方式：技能#延迟（单位：秒），多个配置由‘,’衔接；不配置默认不延后<br>" +
                    "如：1D65#0.6,1D66#0.6,4092#1,6502#1"
            },
            name: {
                cn: "技能延迟"
            },
            type: "string",
            default: "1D65#1.25,1D66#1.1,4092#1.5,6502#1.25"
        }
    ],
    triggers: [
        {
            id: "leilei GBFR parrot shouting",
            comment: {
                cn: "配置的指定技能直/暴时，鬼叫すごい；直暴时，鬼叫アンビリーバボ—"
            },
            netRegex: NetRegexes.ability(),
            condition: (data, matches, output) => {
                if (matches.source !== data.me) {
                    //不是自己释放
                    return false;
                }

                const skillList = data.triggerSetConfig.skill_list.split("#");
                const result = skillList.find((v) => {
                    return v === matches.id;
                });
                if (typeof (result) === "undefined") {
                    //技能不匹配
                    return false;
                }

                const flags = matches.flags;
                const code = flags[flags.length - 4];
                //非不直不爆
                return code !== "0";
            },
            delaySeconds: (data, matches) => {
                return getDelaySeconds(data.triggerSetConfig.skill_delay_list, matches.id);
            },
            sound: (data, matches, output) => {
                var flags = matches.flags;
                /**
                 *  Damage bitmasks:
                 *  0x2000 = crit damage
                 *  0x4000 = direct hit damage
                 *  0x6000 = crit direct hit damage
                 * 
                 *  For example, the flags for successful rear trick attack are 1971.003.
                 *  The . here represents 2, 4, or 6 as the trick may crit, dh, both, or neither.
                 */
                const code = flags[flags.length - 4];
                if (code === "2" || code === "4") {
                    return data.triggerSetConfig.C_or_D_audio_url;
                } else if (code === "6") {
                    return data.triggerSetConfig.C_and_D_audio_url;
                }

                return null;
            },
        },
        {
            id: "leilei ability id test",
            netRegex: NetRegexes.ability(),
            condition: (data, matches, output) => {
                if (!data.triggerSetConfig.ability_test_enable) {
                    return false;
                }

                //自己释放
                return matches.source === data.me;
            },
            run: (data, matches) => {
                console.log(matches.id);
            }
        }
    ]
})