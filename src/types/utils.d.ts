/* eslint-disable @typescript-eslint/no-explicit-any */

export type FullPaths<TObject> = {
    [TKey in keyof TObject & string]: TObject[TKey] extends Record<string, unknown>
        ? `${TKey}.${Paths<TObject[TKey]>}`
        : TObject[TKey] extends Record<string, unknown>[]
          ? `${TKey}.0.${Paths<TObject[TKey][number]>}`
          : TKey;
}[keyof TObject & string];

export type Paths<TObject> = {
    [TKey in keyof TObject & string]: TObject[TKey] extends Record<string, unknown>
        ? `${TKey}.${Paths<TObject[TKey]>}` | TKey
        : TObject[TKey] extends Record<string, unknown>[]
          ? `${TKey}.0.${Paths<TObject[TKey][number]>}` | `${TKey}.0` | TKey
          : TKey;
}[keyof TObject & string];

export type Get<
    TObject,
    TPath extends Paths<TObject>,
> = TPath extends `${infer TKey extends string & keyof TObject}.${infer TRest}`
    ? Get<TObject[TKey], TRest & Paths<TObject[TKey]>>
    : TPath extends keyof TObject
      ? TObject[TPath]
      : never;

export type Flat<TObject> = {
    [TPath in Paths<TObject>]: Get<TObject, TPath>;
};

export type Build<TPath extends string, TValue> = TPath extends `${infer TKey}.${infer TRest}`
    ? TKey extends '0'
        ? Build<TRest, TValue>[]
        : { [K in TKey]: Build<TRest, TValue> }
    : { [K in TPath]: TValue };

// Merge two object types deeply
export type Merge<TObjectA, TObjectB> = {
    [TKey in keyof TObjectA | keyof TObjectB]: TKey extends keyof TObjectA
        ? TKey extends keyof TObjectB
            ? Merge<TObjectA[TKey], TObjectB[TKey]>
            : TObjectA[TKey]
        : TKey extends keyof TObjectB
          ? TObjectB[TKey]
          : never;
};

// Merge a union of objects into one object
export type UnionToIntersection<TUnion> = (
    TUnion extends any ? (x: TUnion) => void : never
) extends (x: infer TIntersection) => void
    ? TIntersection
    : never;

// Main inversion: flat object → nested object
export type Unflat<TFlatObject> = UnionToIntersection<
    {
        [TPath in keyof TFlatObject & string]: Build<TPath, TFlatObject[TPath]>;
    }[keyof TFlatObject & string]
>;

export type OptionalPath<TObject, TPath extends FullPaths<TObject>> = Unflat<
    Omit<Flat<TObject>, TPath | `${TPath}.${string}`> & Partial<Pick<Flat<TObject>, TPath>>
>;
export type UnionProperties<TObject, TType> = {
    [TKey in keyof TObject]: TObject[TKey] | TType;
};
export type UnionPath<TObject, TPath extends Paths<TObject>, TType> = Unflat<
    Omit<Flat<TObject>, TPath> & UnionProperties<Pick<Flat<TObject>, TPath>, TType>
>;

export type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
