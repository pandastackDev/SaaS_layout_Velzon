import React from "react";

interface FilterProps {
	column: {
		Filter?: unknown;
		render: (filter: string) => React.ReactNode;
	};
}

export const Filter = ({ column }: FilterProps) => {
	return (
		<>
			{column.Filter && (
				<div style={{ marginTop: 5 }}>{column.render("Filter")}</div>
			)}
		</>
	);
};

interface DefaultColumnProps {
	column: {
		filterValue?: string;
		setFilter?: (value: string | undefined) => void;
		preFilteredRows: { length: number };
	};
}

export const DefaultColumnFilter = ({
	column: {
		filterValue,
		setFilter,
		preFilteredRows: { length },
	},
}: DefaultColumnProps) => {
	return (
		<input
			value={filterValue || ""}
			onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
				setFilter?.(e.target.value || undefined);
			}}
			placeholder={`search (${length}) ...`}
		/>
	);
};

interface SelectColumnFilterProps {
	column: {
		filterValue?: string;
		setFilter?: (value: string | undefined) => void;
		preFilteredRows: Array<{ values: Record<string, unknown> }>;
		id: string;
	};
}

export const SelectColumnFilter = ({
	column: { filterValue, setFilter, preFilteredRows, id },
}: SelectColumnFilterProps) => {
	const options = React.useMemo(() => {
		const optionSet = new Set<unknown>();
		preFilteredRows.forEach((row) => {
			optionSet.add(row.values[id]);
		});
		return [...optionSet.values()];
	}, [id, preFilteredRows]);

	return (
		<select
			id="custom-select"
			className="form-select"
			value={filterValue}
			onChange={(e) => {
				setFilter?.(e.target.value || undefined);
			}}
		>
			<option value="">All</option>
			{options.map((option) => (
				<option key={String(option)} value={String(option)}>
					{String(option)}
				</option>
			))}
		</select>
	);
};
