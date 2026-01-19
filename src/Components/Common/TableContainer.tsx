import { rankItem } from "@tanstack/match-sorter-utils";
import {
	type Column,
	type ColumnFiltersState,
	type FilterFn,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type Table as ReactTable,
	useReactTable,
} from "@tanstack/react-table";
import React, { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CardBody, Col, Row, Table } from "reactstrap";

import {
	CompaniesGlobalFilter,
	ContactsGlobalFilter,
	CryptoOrdersGlobalFilter,
	CustomersGlobalFilter,
	InvoiceListGlobalSearch,
	LeadsGlobalFilter,
	NFTRankingGlobalFilter,
	OrderGlobalFilter,
	ProductsGlobalFilter,
	TaskListGlobalFilter,
	TicketsListGlobalFilter,
} from "../../Components/Common/GlobalSearchFilter";

// Column Filter
const Filter = ({
	column,
}: {
	column: Column<unknown, unknown>;
	table: ReactTable<unknown>;
}) => {
	const columnFilterValue = column.getFilterValue();

	return (
		<>
			<DebouncedInput
				type="text"
				value={(columnFilterValue ?? "") as string}
				onChange={(value) => column.setFilterValue(value)}
				placeholder="Search..."
				className="w-36 border shadow rounded"
				list={`${column.id}list`}
			/>
			<div className="h-1" />
		</>
	);
};

// Global Filter
const DebouncedInput = ({
	value: initialValue,
	onChange,
	debounce = 500,
	...props
}: {
	value: string | number;
	onChange: (value: string | number) => void;
	debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) => {
	const [value, setValue] = useState(initialValue);

	useEffect(() => {
		setValue(initialValue);
	}, [initialValue]);

	useEffect(() => {
		const timeout = setTimeout(() => {
			onChange(value);
		}, debounce);

		return () => clearTimeout(timeout);
	}, [debounce, onChange, value]);

	return (
		<input
			{...props}
			value={value}
			id="search-bar-0"
			className="form-control search"
			onChange={(e) => setValue(e.target.value)}
		/>
	);
};

interface TableContainerProps {
	columns?: Column<unknown, unknown>[];
	data?: unknown[];
	isGlobalFilter?: boolean;
	isProductsFilter?: boolean;
	isCustomerFilter?: boolean;
	isOrderFilter?: boolean;
	isContactsFilter?: boolean;
	isCompaniesFilter?: boolean;
	isLeadsFilter?: boolean;
	isCryptoOrdersFilter?: boolean;
	isInvoiceListFilter?: boolean;
	isTicketsListFilter?: boolean;
	isNFTRankingFilter?: boolean;
	isTaskListFilter?: boolean;
	handleTaskClick?: (task: unknown) => void;
	customPageSize?: number;
	tableClass?: string;
	theadClass?: string;
	trClass?: string;
	thClass?: string;
	divClass?: string;
	SearchPlaceholder?: string;
	handleLeadClick?: (lead: unknown) => void;
	handleCompanyClick?: (company: unknown) => void;
	handleContactClick?: (contact: unknown) => void;
	handleTicketClick?: (ticket: unknown) => void;
}

const TableContainer = ({
	columns,
	data,
	isGlobalFilter,
	isProductsFilter,
	isCustomerFilter,
	isOrderFilter,
	isContactsFilter,
	isCompaniesFilter,
	isLeadsFilter,
	isCryptoOrdersFilter,
	isInvoiceListFilter,
	isTicketsListFilter,
	isNFTRankingFilter,
	isTaskListFilter,
	customPageSize,
	tableClass,
	theadClass,
	trClass,
	thClass,
	divClass,
	SearchPlaceholder,
}: TableContainerProps) => {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = useState("");

	const fuzzyFilter: FilterFn<unknown> = (row, columnId, value, addMeta) => {
		const itemRank = rankItem(row.getValue(columnId), value);
		addMeta({
			itemRank,
		});
		return itemRank.passed;
	};

	const table = useReactTable({
		columns,
		data,
		filterFns: {
			fuzzy: fuzzyFilter,
		},
		state: {
			columnFilters,
			globalFilter,
		},
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: fuzzyFilter,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	const {
		getHeaderGroups,
		getRowModel,
		getCanPreviousPage,
		getCanNextPage,
		getPageOptions,
		setPageIndex,
		nextPage,
		previousPage,
		setPageSize,
		getState,
	} = table;

	useEffect(() => {
		Number(customPageSize) && setPageSize(Number(customPageSize));
	}, [customPageSize, setPageSize]);

	return (
		<Fragment>
			{isGlobalFilter && (
				<Row className="mb-3">
					<CardBody className="border border-dashed border-end-0 border-start-0">
						<form>
							<Row>
								<Col sm={5}>
									<div
										className={
											isProductsFilter ||
											isContactsFilter ||
											isCompaniesFilter ||
											isNFTRankingFilter
												? "search-box me-2 mb-2 d-inline-block"
												: "search-box me-2 mb-2 d-inline-block col-12"
										}
									>
										<DebouncedInput
											value={globalFilter ?? ""}
											onChange={(value) => setGlobalFilter(String(value))}
											placeholder={SearchPlaceholder}
										/>
										<i className="bx bx-search-alt search-icon"></i>
									</div>
								</Col>
								{isProductsFilter && <ProductsGlobalFilter />}
								{isCustomerFilter && <CustomersGlobalFilter />}
								{isOrderFilter && <OrderGlobalFilter />}
								{isContactsFilter && <ContactsGlobalFilter />}
								{isCompaniesFilter && <CompaniesGlobalFilter />}
								{isLeadsFilter && <LeadsGlobalFilter />}
								{isCryptoOrdersFilter && <CryptoOrdersGlobalFilter />}
								{isInvoiceListFilter && <InvoiceListGlobalSearch />}
								{isTicketsListFilter && <TicketsListGlobalFilter />}
								{isNFTRankingFilter && <NFTRankingGlobalFilter />}
								{isTaskListFilter && <TaskListGlobalFilter />}
							</Row>
						</form>
					</CardBody>
				</Row>
			)}

			<div className={divClass}>
				<Table hover className={tableClass}>
					<thead className={theadClass}>
						{getHeaderGroups().map((headerGroup) => (
							<tr className={trClass} key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className={thClass}
										{...{
											onClick: header.column.getToggleSortingHandler(),
										}}
									>
										{header.isPlaceholder ? null : (
											<React.Fragment>
												{flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
												{{
													asc: " ",
													desc: " ",
												}[header.column.getIsSorted() as string] ?? null}
												{header.column.getCanFilter() ? (
													<div>
														<Filter column={header.column} table={table} />
													</div>
												) : null}
											</React.Fragment>
										)}
									</th>
								))}
							</tr>
						))}
					</thead>

					<tbody>
						{getRowModel().rows.map((row) => {
							return (
								<tr key={row.id}>
									{row.getVisibleCells().map((cell) => {
										return (
											<td key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</td>
										);
									})}
								</tr>
							);
						})}
					</tbody>
				</Table>
			</div>

			<Row className="align-items-center mt-2 g-3 text-center text-sm-start">
				<div className="col-sm">
					<div className="text-muted">
						Showing
						<span className="fw-semibold ms-1">
							{getState().pagination.pageSize}
						</span>{" "}
						of <span className="fw-semibold">{data.length}</span> Results
					</div>
				</div>
				<div className="col-sm-auto">
					<ul className="pagination pagination-separated pagination-md justify-content-center justify-content-sm-start mb-0">
						<li
							className={
								!getCanPreviousPage() ? "page-item disabled" : "page-item"
							}
						>
							<Link to="#" className="page-link" onClick={previousPage}>
								Previous
							</Link>
						</li>
						{getPageOptions().map((item) => (
							<React.Fragment key={item}>
								<li className="page-item">
									<Link
										to="#"
										className={
											getState().pagination.pageIndex === item
												? "page-link active"
												: "page-link"
										}
										onClick={() => setPageIndex(item)}
									>
										{item + 1}
									</Link>
								</li>
							</React.Fragment>
						))}
						<li
							className={!getCanNextPage() ? "page-item disabled" : "page-item"}
						>
							<Link to="#" className="page-link" onClick={nextPage}>
								Next
							</Link>
						</li>
					</ul>
				</div>
			</Row>
		</Fragment>
	);
};

export default TableContainer;
