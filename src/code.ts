import { Observable, EMPTY } from "rxjs"
import { debounceTime, pluck, distinctUntilChanged, switchMap, catchError } from "rxjs/operators"

export const breweryTypeAhead = (ajaxHelper) => {
  return (sourceObservable: Observable<any>) => {
    return sourceObservable.pipe(
      debounceTime(200),
      pluck('target', 'value'),
      distinctUntilChanged(),
      switchMap((searchTerm) => {
        console.log('afes', sourceObservable);
        return ajaxHelper.getJson().pipe((catchError(() => EMPTY)))
      })
    )
  }
}