import type { AnyFieldApi } from "@tanstack/react-form";

function FieldInfo({ field }: { field: AnyFieldApi }) {
    return (
        <>
            {field.state.meta.isTouched && !field.state.meta.isValid ? (
                <div className="flex flex-col gap-1">
                    {field.state.meta.errors.map((err) => (
                        <p key={err.message} className="text-red-500 text-sm">{err.message}</p>
                    ))}
                </div>)
                : null}
            {field.state.meta.isValidating ? <p className="text-sm">Validando...</p> : null}
        </>
    )
  }

export default FieldInfo;