import React, { Suspense } from "react";

const LazyCodeEditor = React.lazy(() => import("@uiw/react-textarea-code-editor"));

export const CodeEditorArea: React.FunctionComponent<Parameters<typeof LazyCodeEditor>[0]> = (
    props
) => (
    <Suspense>
        <LazyCodeEditor {...props} />
    </Suspense>
);
