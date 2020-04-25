import { of } from "rxjs"
import { map, toArray, mergeMap, delay, catchError } from "rxjs/operators";

describe('It uses subscribe and assert approach to test rxjs', () => {
  it('should compare each emitted value', () => {
    const source$ = of(1,2,3);
    const final$ = source$.pipe(
      map((v) => v * 10)
    );

    const expectedValues = [10, 20, 30];
    let idx = 0;

    final$.subscribe((v) => {
      expect(v).toEqual(expectedValues[idx]);
      idx++;
    })
  })

  it('should compare emitted values on complettion with toArray()', () => {
    const source$ = of(1,2,3);
    const final$ = source$.pipe(
      map((v) => v * 10),
      toArray()
    );

    final$.subscribe((v) => {
      expect(v).toEqual([10, 20, 30]);
    })
  })

  it('should let you test async operators with done callback', (done) => {
    const source$ = of('Ready', 'Set', 'Go!');
    const final$ = source$.pipe(
      mergeMap((message, index) => {
        return of(message).pipe(
          delay(index * 1000)
        )
      })
    );

    const expected = ['Ready', 'Set', 'Go!'];
    let idx = 0;

    final$.subscribe((val) => {
      expect(val).toEqual(expected[idx]);
      idx++;
    }, null, done)

  });

  it('should let you test errors and error messages', () => {
    const source$ = of({firstname: 'Brian', lastname: 'Smith'}, null).pipe(
      map((o) => `${o.firstname} ${o.lastname}`),
      catchError(() => {
        throw 'Invalid user!'
      })
    );

    const expected = ['Brian Smith', 'Invalid user!']
    const actual = [];
    let idx = 0;

    source$.subscribe({
      next: (val) => {
        actual.push(val);
        // idx++;
      },
      error: (error) => {
        actual.push(error);
        expect(actual).toEqual(expected);
      }
    })
  });
})