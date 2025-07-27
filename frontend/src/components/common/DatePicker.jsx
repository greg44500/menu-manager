import { format, getISOWeek } from "date-fns"
import { fr } from "date-fns/locale"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

const DatePicker = ({
    id,
    label,
    date,
    setDate,
    mondayOnly = true,
    showWeekNumber = true,
    ...props
}) => (
    <div>
        {label && <label className="label" htmlFor={id}>{label}</label>}
        <div className="flex items-center gap-2">
            <DayPicker
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={fr}
                weekStartsOn={1}
                disabled={mondayOnly ? (d) => d.getDay() !== 1 : undefined}
                modifiersClassNames={{
                    selected: "bg-primary text-white",
                }}
                className="border rounded-lg shadow-md"
                {...props}
            />
            {date && (
                <span className="flex flex-col ml-3">
                    <span className="date-value px-2 py-1 rounded bg-gray-100 border text-sm">
                        {format(date, "dd/MM/yyyy", { locale: fr })}
                    </span>
                    {showWeekNumber && (
                        <span className="week-value mt-1 text-xs text-gray-500 pl-1">
                            Semaine&nbsp;{getISOWeek(date)}
                        </span>
                    )}
                </span>
            )}
            {!date && (
                <span className="text-xs text-gray-400 ml-2">
                    {mondayOnly ? "Choisissez un lundi" : "Choisissez une date"}
                </span>
            )}
        </div>
    </div>
)

export default DatePicker
