import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	Card,
	CardBody,
	CardHeader,
	Col,
	Container,
	Row,
	Table,
	Button,
	Input,
	Label,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Form,
	FormFeedback,
	Badge,
} from "reactstrap";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useFormik } from "formik";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Pagination from "../../../Components/Common/Pagination";
import { supabase } from "../../../lib/supabase";
import { useAdmin } from "../../../hooks/useAdmin";
import { getErrorMessage } from "../../../lib/errorHandler";
import { TablePageSkeleton } from "../../../Components/Common/LoadingSkeleton";

/**
 * PricingPlan interface
 * 
 * Expected Supabase table schema for 'pricing_plans':
 * - id: uuid (primary key)
 * - plan_name: text (required)
 * - plan_type: text (default: 'subscription')
 * - price: numeric/decimal (required)
 * - billing_cycle: text (default: 'monthly')
 * - features: text or jsonb (stored as JSON string array)
 * - description: text (optional)
 * - is_active: boolean (default: true)
 * - created_at: timestamp (default: now())
 * - updated_at: timestamp (default: now())
 */
interface PricingPlan {
	id?: string;
	plan_name: string;
	plan_type: string;
	price: number;
	billing_cycle: string;
	features: string[];
	description?: string;
	is_active: boolean;
	created_at?: string;
	updated_at?: string;
}

const ManagePricing = () => {
	document.title = "Manage Pricing | PITCH INVEST";
	const navigate = useNavigate();
	const { isAdmin, loading: adminLoading } = useAdmin();
	const [loading, setLoading] = useState(true);
	const [plans, setPlans] = useState<PricingPlan[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [perPageData] = useState(10);
	const [editModal, setEditModal] = useState(false);
	const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

	useEffect(() => {
		// Don't do anything while still checking admin status
		if (adminLoading) {
			return;
		}

		// Only redirect if we're sure user is not admin (not during loading/checking)
		if (!isAdmin && !adminLoading) {
			console.log("User is not admin, redirecting to dashboard");
			navigate("/dashboard", { replace: true });
			return;
		}

		// User is admin, load data
		if (isAdmin) {
			loadPricingPlans();
		}
	}, [isAdmin, adminLoading, navigate]);

	const loadPricingPlans = async () => {
		try {
			setLoading(true);
			console.log("Loading pricing plans from Supabase...");
			
			// Fetch from pricing_plans table
			const { data, error } = await supabase
				.from("pricing_plans")
				.select("*")
				.order("created_at", { ascending: false });

			if (error) {
				// If table doesn't exist, show helpful message
				if (error.code === "PGRST116" || error.message?.includes("relation") || error.message?.includes("does not exist")) {
					console.warn("pricing_plans table does not exist. Please create it in Supabase.");
					toast.warning("Pricing plans table not found. Please create the 'pricing_plans' table in Supabase.");
					setPlans([]);
					return;
				}
				throw error;
			}

			if (!data || data.length === 0) {
				console.log("No pricing plans found in database");
				setPlans([]);
				return;
			}

			// Transform data to match our interface
			// Handle features - could be JSON string, array, or comma-separated string
			const transformedPlans: PricingPlan[] = data.map((plan: any) => {
				let features: string[] = [];
				
				if (plan.features) {
					if (typeof plan.features === "string") {
						try {
							// Try parsing as JSON first
							const parsed = JSON.parse(plan.features);
							features = Array.isArray(parsed) ? parsed : [plan.features];
						} catch {
							// If not JSON, treat as comma-separated string
							features = plan.features.split(",").map((f: string) => f.trim()).filter((f: string) => f);
						}
					} else if (Array.isArray(plan.features)) {
						features = plan.features;
					}
				}

				return {
					id: plan.id,
					plan_name: plan.plan_name || plan.name || "",
					plan_type: plan.plan_type || plan.type || "subscription",
					price: parseFloat(plan.price || plan.plan_price || 0),
					billing_cycle: plan.billing_cycle || plan.billing_period || "monthly",
					features: features,
					description: plan.description || "",
					is_active: plan.is_active !== undefined ? plan.is_active : true,
					created_at: plan.created_at,
				};
			});

			console.log("Pricing plans loaded:", transformedPlans.length);
			setPlans(transformedPlans);
			setCurrentPage(1); // Reset to first page when data loads
		} catch (error: any) {
			console.error("Error loading pricing plans:", error);
			const errorMsg = getErrorMessage(error);
			toast.error(`Failed to load pricing plans: ${errorMsg}`);
			setPlans([]);
		} finally {
			setLoading(false);
		}
	};

	const validation = useFormik({
		enableReinitialize: true,
		initialValues: {
			plan_name: selectedPlan?.plan_name || "",
			plan_type: selectedPlan?.plan_type || "subscription",
			price: selectedPlan?.price || 0,
			billing_cycle: selectedPlan?.billing_cycle || "monthly",
			description: selectedPlan?.description || "",
			features: selectedPlan?.features?.join(", ") || "",
		},
		validationSchema: Yup.object({
			plan_name: Yup.string().required("Plan name is required"),
			price: Yup.number().min(0, "Price must be positive").required("Price is required"),
			billing_cycle: Yup.string().required("Billing cycle is required"),
		}),
		onSubmit: async (values) => {
			try {
				setLoading(true);
				
				// Parse features from comma-separated string
				const features = values.features
					.split(",")
					.map((f: string) => f.trim())
					.filter((f: string) => f);

				const planData = {
					plan_name: values.plan_name,
					plan_type: values.plan_type,
					price: parseFloat(values.price.toString()),
					billing_cycle: values.billing_cycle,
					features: JSON.stringify(features), // Store as JSON string
					description: values.description || null,
					is_active: true,
					updated_at: new Date().toISOString(),
				};

				if (selectedPlan?.id) {
					// Update existing plan
					const { error } = await supabase
						.from("pricing_plans")
						.update(planData)
						.eq("id", selectedPlan.id);

					if (error) throw error;
					toast.success("Pricing plan updated successfully!");
				} else {
					// Create new plan
					planData.created_at = new Date().toISOString();
					const { error } = await supabase
						.from("pricing_plans")
						.insert([planData]);

					if (error) throw error;
					toast.success("Pricing plan created successfully!");
				}

				setEditModal(false);
				setSelectedPlan(null);
				await loadPricingPlans();
			} catch (error: any) {
				const errorMsg = getErrorMessage(error);
				toast.error(`Failed to save pricing plan: ${errorMsg}`);
			} finally {
				setLoading(false);
			}
		},
	});

	const handleEdit = (plan: PricingPlan) => {
		setSelectedPlan(plan);
		setEditModal(true);
	};

	const handleAddNew = () => {
		setSelectedPlan(null);
		validation.resetForm();
		setEditModal(true);
	};

	if (adminLoading || loading) {
		return (
			<div className="page-content">
				<Container fluid>
					<BreadCrumb title="Manage Pricing" pageTitle="Admin" />
					<Row>
						<Col xs={12}>
							<TablePageSkeleton columns={7} rows={5} />
						</Col>
					</Row>
				</Container>
			</div>
		);
	}

	if (!isAdmin) {
		return null;
	}

	// Calculate pagination
	const indexOfLastData = currentPage * perPageData;
	const indexOfFirstData = indexOfLastData - perPageData;
	const currentPlans = plans.slice(indexOfFirstData, indexOfLastData);

	return (
		<div className="page-content">
			<Container fluid>
				<BreadCrumb title="Manage Pricing" pageTitle="Admin" />

				<Row>
					<Col xs={12}>
						<Card>
							<CardHeader className="d-flex justify-content-between align-items-center">
								<h4 className="card-title mb-0">Subscription Plans</h4>
								<Button color="primary" onClick={handleAddNew}>
									<i className="ri-add-line me-1"></i>Add New Plan
								</Button>
							</CardHeader>
							<CardBody>
								<div className="table-responsive">
									<Table className="table-nowrap align-middle mb-0">
										<thead className="table-light">
											<tr>
												<th>Plan Name</th>
												<th>Type</th>
												<th>Price</th>
												<th>Billing Cycle</th>
												<th>Features</th>
												<th>Status</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{plans.length === 0 ? (
												<tr>
													<td colSpan={7} className="text-center py-4">
														<p className="text-muted mb-0">No pricing plans found</p>
													</td>
												</tr>
											) : (
												currentPlans.map((plan) => (
													<tr key={plan.id || plan.plan_name}>
														<td>
															<h6 className="mb-0">{plan.plan_name}</h6>
															{plan.description && (
																<small className="text-muted">{plan.description}</small>
															)}
														</td>
														<td>
															<Badge className="bg-primary-subtle text-primary">
																{plan.plan_type}
															</Badge>
														</td>
														<td>
															<strong>${plan.price.toFixed(2)}</strong>
														</td>
														<td>
															<Badge className="bg-info-subtle text-info">
																{plan.billing_cycle}
															</Badge>
														</td>
														<td>
															<ul className="list-unstyled mb-0">
																{plan.features?.slice(0, 2).map((feature, idx) => (
																	<li key={idx} className="text-muted">
																		<i className="ri-check-line text-success me-1"></i>
																		{feature}
																	</li>
																))}
																{plan.features && plan.features.length > 2 && (
																	<li className="text-muted">
																		+{plan.features.length - 2} more
																	</li>
																)}
															</ul>
														</td>
														<td>
															{plan.is_active ? (
																<Badge className="bg-success">Active</Badge>
															) : (
																<Badge className="bg-secondary">Inactive</Badge>
															)}
														</td>
														<td>
															<Button
																color="soft-primary"
																size="sm"
																onClick={() => handleEdit(plan)}
															>
																<i className="ri-edit-line"></i>
															</Button>
														</td>
													</tr>
												))
											)}
										</tbody>
									</Table>
								</div>
								{plans.length > 0 && (
									<Pagination
										data={plans}
										currentPage={currentPage}
										setCurrentPage={setCurrentPage}
										perPageData={perPageData}
									/>
								)}
							</CardBody>
						</Card>
					</Col>
				</Row>
			</Container>

			{/* Edit/Add Modal */}
			<Modal isOpen={editModal} toggle={() => setEditModal(false)} size="lg" centered>
				<ModalHeader toggle={() => setEditModal(false)}>
					{selectedPlan ? "Edit Pricing Plan" : "Add New Pricing Plan"}
				</ModalHeader>
				<ModalBody>
					<Form
						onSubmit={(e) => {
							e.preventDefault();
							validation.handleSubmit();
						}}
					>
						<Row>
							<Col md={6}>
								<Label>Plan Name *</Label>
								<Input
									name="plan_name"
									value={validation.values.plan_name}
									onChange={validation.handleChange}
									onBlur={validation.handleBlur}
									invalid={!!(validation.touched.plan_name && validation.errors.plan_name)}
								/>
								{validation.touched.plan_name && validation.errors.plan_name && (
									<FormFeedback type="invalid">{validation.errors.plan_name}</FormFeedback>
								)}
							</Col>
							<Col md={6}>
								<Label>Plan Type *</Label>
								<Input
									type="select"
									name="plan_type"
									value={validation.values.plan_type}
									onChange={validation.handleChange}
								>
									<option value="subscription">Subscription</option>
									<option value="advertising">Advertising</option>
								</Input>
							</Col>
							<Col md={6}>
								<Label>Price (USD) *</Label>
								<Input
									type="number"
									name="price"
									value={validation.values.price}
									onChange={validation.handleChange}
									onBlur={validation.handleBlur}
									invalid={!!(validation.touched.price && validation.errors.price)}
									step="0.01"
									min="0"
								/>
								{validation.touched.price && validation.errors.price && (
									<FormFeedback type="invalid">{validation.errors.price}</FormFeedback>
								)}
							</Col>
							<Col md={6}>
								<Label>Billing Cycle *</Label>
								<Input
									type="select"
									name="billing_cycle"
									value={validation.values.billing_cycle}
									onChange={validation.handleChange}
									onBlur={validation.handleBlur}
									invalid={
										!!(validation.touched.billing_cycle && validation.errors.billing_cycle)
									}
								>
									<option value="monthly">Monthly</option>
									<option value="yearly">Yearly</option>
								</Input>
							</Col>
							<Col md={12}>
								<Label>Description</Label>
								<Input
									type="textarea"
									name="description"
									value={validation.values.description}
									onChange={validation.handleChange}
									rows={3}
								/>
							</Col>
							<Col md={12}>
								<Label>Features (comma-separated)</Label>
								<Input
									type="textarea"
									name="features"
									value={validation.values.features}
									onChange={validation.handleChange}
									rows={4}
									placeholder="Feature 1, Feature 2, Feature 3"
								/>
							</Col>
						</Row>
					</Form>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={() => setEditModal(false)}>
						Cancel
					</Button>
					<Button color="primary" onClick={() => validation.handleSubmit()}>
						<i className="ri-save-line me-1"></i>
						{selectedPlan ? "Update Plan" : "Create Plan"}
					</Button>
				</ModalFooter>
			</Modal>
		</div>
	);
};

export default ManagePricing;
