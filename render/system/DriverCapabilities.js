/**
 * Indicates a device's capabilities.
 * @enum {int}
 * @readonly
 */
const DriverCapabilities = Object.freeze({
    /** The device has multiple outputs. */
    HAS_MULTIPLE_OUTPUTS:      1 << 0,
    /** The device can send its audio and video to different outputs simultaneously. */
    CAN_DECOUPLE_AUDIO_OUTPUT: 1 << 1,
});

export default DriverCapabilities;
