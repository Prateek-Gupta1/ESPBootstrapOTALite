
const Device = require('../models/deviceModel');

class DeviceManager {

    constructor() {}

    register(device) {
        const deviceInfo = new Device({
            mac_address: device.mac_address,
            name: device.name,
            user: device.userId,
            description: device.description,
            model: device.modelName,
          });
        //Todo : Check if user exists in database.
        return deviceInfo.register();
    }

    listAllDevicesforUser(userId) {
        return Device.fetchAllMappedToUserId(userId);
    }

    getDeviceInfoForMac(macAddress) {
        return Device.fetchWithMacAddress(macAddress);
    }

    getDeviceInfoForId(deviceId) {
        return Device.fetchWithDeviceId(deviceId);
    }

}

module.exports = DeviceManager;