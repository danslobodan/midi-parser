// MSB - Most Significant Byte
// LSB - Least Significant Byte

// List bellow is incomplete
// For complete list of controllers
// https://www.mixagesoftware.com/en/midikit/help/HTML/controllers.html

export enum ControllerNumber {
    BANK_SELECT_MSB = 0,
    MODULATION_WHEEL_MSB = 1,
    BREATH_MSB = 2,
    FOOT_MSB = 4,
    PORTAMENTO_TIME_MSB = 5,
    DATA_ENTRY_MSB = 6,
    VOLUME_MSB = 7,
    BALANCE_MSB = 8,
    PAN_MSB = 10,
    EXPRESSION_MSB = 11,
    EFFECT_CONTROL_1_MSB = 12,
    EFFECT_CONTROL_2_MSB = 13,
    GENERAL_PURPOSE_1_MSB = 16,
    GENERAL_PURPOSE_2_MSB = 17,
    GENERAL_PURPOSE_3_MSB = 18,
    GENERAL_PURPOSE_4_MSB = 19,
    BANK_SELECT_LSB = 32,
    MODULATION_WHEEL_LSB = 33,
    BREATH_LSB = 34,
    FOOT_LSB = 36,
    PORTAMENTO_TIME_LSB = 37,
    DATA_ENTRY_LSB = 38,
    VOLUME_LSB = 39,
    BALANCE_LSB = 40,
    PAN_LSB = 42,
    EXPRESSION_LSB = 43,
    EFFECT_CONTROL_1_LSB = 44,
    EFFECT_CONTROL_2_LSB = 45,
    GENERAL_PURPOSE_1_LSB = 48,
    GENERAL_PURPOSE_2_LSB = 49,
    GENERAL_PURPOSE_3_LSB = 50,
    GENERAL_PURPOSE_4_LSB = 51,
    SUSTAIN_PEDAL = 64,
    ALL_SOUND_OFF = 120,
    RESET_ALL_CONTROLLERS = 121,
    ALL_NOTES_OFF = 123,
}
