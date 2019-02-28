import { system } from 'systeminformation/lib/system';
import { cpu } from 'systeminformation/lib/cpu';
import { networkInterfaces } from 'systeminformation/lib/network';
import { mem } from 'systeminformation/lib/memory';
import { osInfo as os } from 'systeminformation/lib/osinfo';

let systemInfo = null;

export async function getSystemInfo() {
  if (systemInfo) return systemInfo;

  systemInfo = await system();

  return systemInfo;
}

let systemId = null;

export async function getSystemId() {
  if (systemId) return systemId;

  if (!systemInfo) {
    await getSystemInfo();
  }

  systemId = systemInfo.uuid.replace(/-/g, '').toLowerCase();

  return systemId;
}

let cpuInfo = null;

export async function getCpuInfo() {
  if (cpuInfo) return cpuInfo;

  cpuInfo = await cpu();

  return cpuInfo;
}

let netInfo = null;

export async function getNetInfo() {
  if (netInfo) return netInfo;

  netInfo = await networkInterfaces();

  return netInfo;
}

let memInfo = null;

export async function getMemInfo() {
  if (memInfo) return memInfo;

  memInfo = await mem();

  return memInfo;
}

let osInfo = null;

export async function getOsInfo() {
  if (osInfo) return osInfo;

  osInfo = await os();

  return osInfo;
}
