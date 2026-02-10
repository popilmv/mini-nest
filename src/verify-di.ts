import 'reflect-metadata';
import { Container } from './mini/container';
import { Injectable } from './mini/decorators/injectable';
import { Inject } from './mini/decorators/inject';

const FOO_TOKEN = Symbol('FOO_TOKEN');

@Injectable()
class ServiceB {
  name = 'B';
}

@Injectable()
class ServiceA {
  constructor(
    public b: ServiceB,
    @Inject(FOO_TOKEN) public foo: string,
  ) {}
}

const c = new Container();

// register custom token
c.register({ provide: FOO_TOKEN, useValue: 'hello-from-token' });

// register classes
c.register({ provide: ServiceA, useClass: ServiceA });
c.register({ provide: ServiceB, useClass: ServiceB });

const a = c.resolve(ServiceA);

console.log('transitive(ServiceA -> ServiceB):', a.b.name === 'B');
console.log('inject_token(@Inject(FOO_TOKEN)):', a.foo);
console.log('singleton(ServiceA):', c.resolve(ServiceA) === a);

if (a.foo !== 'hello-from-token') {
  throw new Error('Inject token override FAILED');
}
