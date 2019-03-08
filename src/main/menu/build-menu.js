import { ipcMain, MenuItem, Menu } from 'electron';

function emit(name) {
  return (menuItem, window) => {
    if (window) {
      window.webContents.send('menu-event', { name });
    }
    else {
      ipcMain.emit('menu-event', { name, menuItem });
    }
  };
}

export function builTemplate(options) {
  return {
    ...options,
    click : options.click || (options.role ? null : emit(options.id)),
  };
}

export function buildMenuItem(options) {
  return new MenuItem(builTemplate(options));
}

export function buildMenu(template = []) {
  const menuItems = [];

  template.forEach((options) => {
    menuItems.push(
      buildMenuItem(options)
    );
  });

  const menu = new Menu();

  menuItems.forEach((x) => menu.append(x));

  return menu;
}
