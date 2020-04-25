import { TestScheduler } from 'rxjs/testing';
import { map, take, delay, catchError } from 'rxjs/operators';
import { concat, from, of, interval } from 'rxjs';


describe('Marble testing in RxJS', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    })
  });

  it('should convert ASCII diagrams into Observables', () => {
    testScheduler.run((helpers) => {
      // all tests should be here
      const { cold , expectObservable, } = helpers;
      const source$ = cold('--a-b---c');
      const expected =     '--a-b---c';

      expectObservable(source$).toBe(expected);
    })
  })


  it('should allow configuration of emitted values', () => {
    testScheduler.run((helpers) => {
      const { cold , expectObservable, } = helpers;
      const source$ = cold('--a-b---c', {a: 1, b: 2, c: 3});
      const filnal$ = source$.pipe(
        map((val: number) => val * 10)
      );
      const expected =     '--a-b---c';

      expectObservable(filnal$).toBe(expected,  {a: 10, b: 20, c: 30});
    })
  })

  it('should let you identify subscription points', () => {
    testScheduler.run((helpers) => {
      const { cold , expectObservable, expectSubscriptions } = helpers;
      const source$ =          cold('-a---b-|');
      const source2$ =         cold('-c---d-|');
      const final$ = concat(source$, source2$);

      const expected =             '-a---b--c---d-|';
      const sourceOneExpectedSub = '^------!';
      const sourceTwoExpectedSub = '-------^------!';

      expectObservable(final$).toBe(expected)
      expectSubscriptions(source$.subscriptions).toBe(sourceOneExpectedSub);
      expectSubscriptions(source2$.subscriptions).toBe(sourceTwoExpectedSub);
    })
  })

  it('should let you test hot observables', () => {
    testScheduler.run((helpers) => {
      const { cold, hot, expectObservable } = helpers;

      const source$ = hot('-a--b-^-c');
      const final$ = source$.pipe(take(1))
      const expected =          '--(c|)';

      expectObservable(final$).toBe(expected);
    })
  })

  it('should let you test synchonys operators', () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const source$ = from([1,2,3,4,5]);
      const expected = '(abcde|)';

      expectObservable(source$).toBe(expected, {a:1, b:2, c:3, d:4, e:5});
    })
  });

  it('should let you test asynchronys operators', () => {
    testScheduler.run((helpers) => {
      const { expectObservable } = helpers;

      const source$ = from([1,2,3]);
      const final$ = source$.pipe(delay(10))
      const expected = '10ms (abc|)'

      expectObservable(final$).toBe(expected, {a: 1, b: 2, c: 3})
    })
  })

  it('should let you test errors and error messages', () => {
    testScheduler.run((helpers) => {
      const { expectObservable } = helpers;
      const source$ = of({firstname: 'Brian', lastname: 'Smith'}, null).pipe(
        map((o) => `${o.firstname} ${o.lastname}`),
        catchError(() => {
          throw {message: 'Invalid user!'}
        })
      );

      const expected = '(a#)';

      expectObservable(source$).toBe(expected, {a: 'Brian Smith'}, {message: 'Invalid user!'})

    })
  });

  it('should let you test snapshots of streams that do not complete', () => {
    testScheduler.run((helpers) => {
      const { expectObservable } = helpers;
      const source$ = interval(1000).pipe(
        map(val => `${val + 1} sec`)
      )

      const expected = '1s a 999ms b 999ms c';
      const unsibscribe = '4s !'

      expectObservable(source$, unsibscribe).toBe(expected, {
        a: '1 sec',
        b: '2 sec',
        c: '3 sec'
      })

    })
  });
});