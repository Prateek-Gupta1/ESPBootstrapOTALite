
const Firmware = require('../models/firmwareModel');
const FirmwareImage = require('../models/firmwareImageModel');

class FirmwareManager {

    constructor() {}

    storeFirmwareImage(fmwBinary) { 
        // Create Firmware image schema object
        const imageFile = new FirmwareImage({
          image_file: fmwBinary,
        });
        return imageFile.storeImage()
    }

    archivePreviousFirmwareOfDevice(deviceId) {
        // Get the active firmware of the device and change its status to Inactive.
        return Firmware.changeActiveFirmwareToInactiveForDevice(deviceId)
    }

    publishFirmwareInfo(firmwareInfo) {
        const info = new Firmware({
          version_name: firmwareInfo.versionName,
          name: firmwareInfo.fmwName,
          description: firmwareInfo.description,
          device: firmwareInfo.deviceId,
          firmware_image: firmwareInfo.imgId,
        })
        return info.publish();
    }

    getActiveFirmwareForDevice(deviceId) {
        return Firmware.getActiveFirmware(deviceId);
    }

    listAllFirmwaresForDevice(deviceId) {
        return Firmware.getAllForDevice(deviceId);
    }

    getFirmwareBinary(imageId) {
        return FirmwareImage.retrieveImage(imageId);
    }
}

module.exports = FirmwareManager;
