# VCD-H5

## Project setup

```cmd
yarn install
```

### Compiles and hot-reloads for development

```cmd
yarn run serve
```

### Compiles and minifies for production

```cmd
yarn run build
```

### Lints and fixes files

```cmd
yarn run lint
```

### Run your unit tests

```cmd
yarn run test:unit
```

### Run your end-to-end tests

```cmd
yarn run test:e2e
```

### Compiles and hot-reloads for development(electron)

```cmd
yarn run serve:electron
```

### Compiles and minifies for production(electron) and pack electron installer

```cmd
yarn run build:electron
```

## Project folder

### **/src/views**

All and only router views should be placed in **/src/views** folder.

### **/src/components**

A component might be used in many component, should be placed in the root(**/src/components**).

A component used in router views should be placed in a named folder(**/src/components/routerView**).

## Project Resource

### **Public**

Resources which might be replaced/customized later, should be placed in **/public** folder.

Logo, background image, media file, etc.

```js
// in vue component
data () { 
  return {
    baseUrl: process.env.BASE_URL
  }
}
```

```html
<!-- in html template -->
<img :src="`${baseUrl}my-image.png`">
```

### **Assets**

Resources used in components, should be placed in **/src/assets** folder.

Icons, component specified image, etc.

```js
// in vue component
const img = import '@/assets/button.png';

data () {
  return {
    img
  }
}
```

or

```html
<!-- in html template -->
<img :src="require('@/assets/button.png')">
```

### **Static**

Resources which arc user accessible, shold be placed in **/static** folder.

Using **__static** to get the path of this folder.

As user might delete it, be careful when reading/writing file from it.

> This folder is used/avariable only for electron.
>
> **/public** folder is packed inside the electron app.
>
> Using **__public** to get the path of it.

## Website Customize

To make the website configurable, all view's configuration should export to **model.UI**.

Each view should have its namespace, which is a capitalize style key.
Each configuration name should be a camelize style key.

```js
const model = {
  models : {
    UI : {
      data : {
        header : false,
        footer : false,
      },
      models : {
        Home  : {},
        About : {},
      },
    }
  },
}
```

## Website Loading

All views should be an async component.

```js
routes : [
  {
    path      : '/about',
    name      : 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component : () => import(/* webpackChunkName: "about" */ '@/views/About.vue'),
  },
],
```
