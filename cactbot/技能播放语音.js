/**
 * u大师要的放技能播放对应语音
 */

var lastShoutingTime = 0;

Options.Triggers.push({
    zoneId: ZoneId.MatchAll,
    id: "leilei skill to audio",
    config: [
        {
            id: "skill_to_audio_ability_test_enable",
            comment: {
                cn: "开启后，在raidboss悬浮窗控制台输出技能id",
                en: "开启后，在raidboss悬浮窗控制台输出技能id",
                jp: "开启后，在raidboss悬浮窗控制台输出技能id",
            },
            name: {
                cn: "开启调试模式",
                en: "开启调试模式",
                jp: "开启调试模式",
            },
            type: "checkbox",
            default: false
        },
        {
            id: "skill_to_audio_audio_foler",
            comment: {
                cn: "音频路径：ui/raidboss/文件夹的相对路径",
                en: "音频路径：ui/raidboss/文件夹的相对路径",
                jp: "音频路径：ui/raidboss/文件夹的相对路径",
            },
            name: {
                cn: "音频路径",
                en: "音频路径",
                jp: "音频路径",
            },
            type: "string",
            default: "../../user/raidboss/"
        },
        {
            id: "skill_to_audio_audio_extra",
            comment: {
                cn: "音频后缀",
                en: "音频后缀",
                jp: "音频后缀",
            },
            name: {
                cn: "音频后缀",
                en: "音频后缀",
                jp: "音频后缀",
            },
            type: "string",
            default: "mp3"
        },
        {
            id: "skill_to_audio_skill_list",
            comment: {
                cn: "技能id列表#号分隔，如：1D65#1D66#4092#6502",
                en: "技能id列表#号分隔，如：1D65#1D66#4092#6502",
                jp: "技能id列表#号分隔，如：1D65#1D66#4092#6502",
            },
            name: {
                cn: "技能id列表",
                en: "技能id列表",
                jp: "技能id列表",
            },
            type: "string",
            default: "1D65#1D66#4092#6502"
        },
    ],
    triggers: [
        {
            id: "leilei skill to audio ability",
            comment: {
                cn: "释放对应技能时，播放音频路径目录下的对应id.mp3",
                en: "释放对应技能时，播放音频路径目录下的对应id.mp3",
                jp: "释放对应技能时，播放音频路径目录下的对应id.mp3",
            },
            netRegex: NetRegexes.ability(),
            condition: (data, matches, output) => {
                if (matches.source !== data.me) {
                    //不是自己释放
                    return false;
                }

                const now = Date.now();
                if (now - lastShoutingTime < 100) {
                    //100毫秒内只喊一次，不然多目标有点吵
                    return false;
                }

                const skillList = data.triggerSetConfig.skill_to_audio_skill_list.split("#");
                const result = skillList.find((v) => {
                    return v === matches.id;
                });
                if (typeof (result) === "undefined") {
                    //技能不匹配
                    return false;
                }

                return true;
            },
            sound: (data, matches, output) => {
                const url = data.triggerSetConfig.skill_to_audio_audio_foler + matches.id + "." + data.triggerSetConfig.skill_to_audio_audio_extra;
                console.log("skill audio url", url);
                return url;
            },
        },
        {
            id: "leilei ability id test",
            netRegex: NetRegexes.ability(),
            condition: (data, matches, output) => {
                if (!data.triggerSetConfig.skill_to_audio_ability_test_enable) {
                    return false;
                }

                //自己释放
                return matches.source === data.me;
            },
            run: (data, matches) => {
                console.log(matches.ability, matches.id);
            }
        },
        {
            id: "leilei skill to audio 血仇", //血仇改成技能名字，随便啥就行 不要重复
            netRegex: NetRegexes.ability({ id: "1D6F" }), //技能id
            condition: (data, matches, output) => {
                //自己对他人释放
                return matches.source === data.me;
            },
            sound: (data, matches, output) => {
                const url = data.triggerSetConfig.skill_to_audio_audio_foler + "cd_" + matches.id + "." + data.triggerSetConfig.skill_to_audio_audio_extra;
                console.log("skill cd audio url", url);
                return url;
            },
            delaySeconds: 5, //技能释放N秒后播放音频
        },
    ]
})