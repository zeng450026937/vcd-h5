import { emittable } from './emittable';
import { observable } from './observable';

@emittable
class MyClass {
  @observable
  name = 'initialized'

  onNameChanged(newVal, oldVal) {
    console.log('callback');
    console.log(newVal, oldVal);
  }
}

const cls = new MyClass();

console.log(cls.name);

cls.name = 'new class';

cls.on('nameChanged', (newVal, oldVal) => {
  console.log('event');
  console.log(newVal, oldVal);
});

cls.name = 'new class new';

cls.emit('nameChanged');

console.log(cls);
