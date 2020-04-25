import { TestScheduler } from "rxjs/testing"
import { breweryTypeAhead } from "./code";
import { of, throwError, interval } from "rxjs";
import { delay, map, catchError } from "rxjs/operators";

describe('Tests breweryTypeAhead', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected)
    })
  });

  it('should ebounce input by 200ms', () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const searchTerm = 'testing'
      const source$ = cold('a', {a: { target: {value: searchTerm}}})
      const final$ = source$.pipe(
        breweryTypeAhead({
          getJson: () => of(searchTerm).pipe(delay(300))
        })
      );
      const expected = '500ms a';

      expectObservable(final$).toBe(expected, {a: searchTerm})
    })
  })

  it('should cancel active request if another value is emitted', () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const searchTerm = 'testing'
      const source$ = cold('a 250ms b', {
        a: { target: {value: 'first'} },
        b: { target: {value: 'second'} },
      })
      const final$ = source$.pipe(
        breweryTypeAhead({
          getJson: () => of(searchTerm).pipe(delay(300))
        })
      );
      const expected = '751ms a';

      expectObservable(final$).toBe(expected, {a: searchTerm})
    })
  })

  it('should not emit duplicate values in a row', () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const searchTerm = 'testing'
      const source$ = cold('a 250ms b', {
        a: { target: {value: 'first'} },
        b: { target: {value: 'first'} },
      })
      const final$ = source$.pipe(
        breweryTypeAhead({
          getJson: () => of(searchTerm).pipe(delay(300))
        })
      );
      const expected = '500ms a';

      expectObservable(final$).toBe(expected, {a: searchTerm})
    })
  })

  it('should ignore ajax errors', () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const searchTerm = 'testing'
      const source$ = cold('a 250ms b', {
        a: { target: {value: 'first'} },
        b: { target: {value: 'first'} },
      })
      const final$ = source$.pipe(
        breweryTypeAhead({
          getJson: () => throwError('error')
        })
      );
      const expected = '';

      expectObservable(final$).toBe(expected)
    })
  });
})
