let routeList = null;

export const findAllRoutes = (routes) => {
  if (routeList) return routeList;
  /* eslint-disable  no-shadow*/
  const find = (routes, result = []) => {
    const getChild = (i) => (i.children ? i.children : []);

    routes.forEach((route) => {
      result.push(route);

      const child = getChild(route);

      find(child, result);
    });

    return result;
  };

  return routeList = find(routes);
};

export const getRoute = (name, routes) => findAllRoutes(routes).find((item) => item.name === name);

export const getPath = (name, routes) => {
  const route = getRoute(name, routes);

  return route ? route.path : null;
};

export default {
  findAllRoutes,
  getRoute,
  getPath,
};
