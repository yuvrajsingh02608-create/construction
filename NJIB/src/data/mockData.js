// Users
export const USERS = [
  { id: 1, name: "Rajesh Kumar", email: "owner@demo.com", password: "demo123", role: "owner", avatar: "RK", phone: "9876500001" },
  { id: 2, name: "Amit Sharma", email: "manager@demo.com", password: "demo123", role: "manager", avatar: "AS", phone: "9876500002" },
  { id: 3, name: "Suresh Patel", email: "engineer@demo.com", password: "demo123", role: "supervisor", avatar: "SP", phone: "9876500003" },
  { id: 4, name: "Vikram Singh", email: "manager2@demo.com", password: "demo123", role: "supervisor", avatar: "VS", phone: "9876500004" },
  { id: 5, name: "Rahul Verma", email: "engineer2@demo.com", password: "demo123", role: "supervisor", avatar: "RV", phone: "9876500005" },
];

// Projects
export const PROJECTS = [
  {
    id: 1, name: "Residential Tower A", location: "Sector 62, Noida",
    client: "ABC Developers", startDate: "2024-01-15", endDate: "2025-06-30",
    budget: 5000000, spent: 2100000, status: "active",
    managerId: 2, supervisorId: 3, progress: 42, workers: 24, description: "G+12 residential tower",
  },
  {
    id: 2, name: "Commercial Plaza", location: "Connaught Place, Delhi",
    client: "XYZ Corp", startDate: "2024-03-01", endDate: "2025-12-31",
    budget: 12000000, spent: 3800000, status: "active",
    managerId: 2, supervisorId: 5, progress: 28, workers: 38, description: "5-floor commercial complex",
  },
  {
    id: 3, name: "Highway Bridge", location: "NH-48, Gurugram",
    client: "NHAI", startDate: "2023-11-01", endDate: "2024-11-30",
    budget: 8000000, spent: 7200000, status: "completed",
    managerId: 2, supervisorId: 5, progress: 100, workers: 52, description: "400m highway overbridge",
  },
  {
    id: 4, name: "Metro Station Extension", location: "Sector 18, Noida",
    client: "DMRC", startDate: "2024-05-10", endDate: "2026-02-28",
    budget: 15000000, spent: 500000, status: "active",
    managerId: 2, supervisorId: 3, progress: 5, workers: 12, description: "Platform extension and new entry/exit",
  },
  {
    id: 5, name: "IT Park Block C", location: "Whitefield, Bangalore",
    client: "Global Tech Parks", startDate: "2024-02-01", endDate: "2025-10-15",
    budget: 25000000, spent: 4500000, status: "onhold",
    managerId: 2, supervisorId: 3, progress: 18, workers: 0, description: "10-floor IT office space",
  },
];

// Workers
export const WORKERS = [
  { id: 1, name: "Ravi Singh", role: "Mason", projectId: 1, dailyWage: 650, phone: "9876543210", status: "active" },
  { id: 2, name: "Mohan Das", role: "Carpenter", projectId: 1, dailyWage: 700, phone: "9876543211", status: "active" },
  { id: 3, name: "Prakash Yadav", role: "Electrician", projectId: 2, dailyWage: 800, phone: "9876543212", status: "active" },
  { id: 4, name: "Deepak Kumar", role: "Plumber", projectId: 2, dailyWage: 750, phone: "9876543213", status: "active" },
  { id: 5, name: "Anil Verma", role: "Helper", projectId: 1, dailyWage: 500, phone: "9876543214", status: "active" },
  { id: 6, name: "Sunil Tiwari", role: "Mason", projectId: 3, dailyWage: 650, phone: "9876543215", status: "inactive" },
  { id: 7, name: "Ramesh Gupta", role: "Welder", projectId: 2, dailyWage: 850, phone: "9876543216", status: "active" },
  { id: 8, name: "Vijay Nair", role: "Painter", projectId: 1, dailyWage: 600, phone: "9876543217", status: "active" },
  { id: 9, name: "Arjun Mehta", role: "Helper", projectId: 3, dailyWage: 500, phone: "9876543218", status: "inactive" },
  { id: 10, name: "Kiran Patil", role: "Supervisor", projectId: 2, dailyWage: 1000, phone: "9876543219", status: "active" },
  { id: 11, name: "Suresh Mehra", role: "Electrician", projectId: 1, dailyWage: 800, phone: "9876543220", status: "active" },
  { id: 12, name: "Rahul Jha", role: "Mason", projectId: 2, dailyWage: 650, phone: "9876543221", status: "active" },
  { id: 13, name: "Manoj Singh", role: "Carpenter", projectId: 4, dailyWage: 700, phone: "9876543222", status: "active" },
  { id: 14, name: "Vikram Sahay", role: "Plumber", projectId: 1, dailyWage: 750, phone: "9876543223", status: "active" },
  { id: 15, name: "Amit Bisht", role: "Helper", projectId: 2, dailyWage: 500, phone: "9876543224", status: "active" },
];

// Tasks
export const TASKS = [
  { id: 1, title: "Foundation Inspection", description: "Inspect all 4 corners", projectId: 1, assigneeId: 3, priority: "high", status: "done", dueDate: "2024-12-01", createdAt: "2024-11-20" },
  { id: 2, title: "Column Shuttering - Floor 3", description: "Complete shuttering for 12 columns", projectId: 1, assigneeId: 2, priority: "high", status: "inprogress", dueDate: "2024-12-20", createdAt: "2024-12-01" },
  { id: 3, title: "Electrical Wiring - Block B", description: "First fix wiring for Block B", projectId: 2, assigneeId: 5, priority: "medium", status: "todo", dueDate: "2024-12-25", createdAt: "2024-12-05" },
  { id: 4, title: "Plumbing Layout Approval", description: "Get approval from client", projectId: 2, assigneeId: 4, priority: "low", status: "review", dueDate: "2024-12-18", createdAt: "2024-12-03" },
  { id: 5, title: "Steel Procurement", description: "Order 50 tons of TMT bars", projectId: 1, assigneeId: 1, priority: "high", status: "done", dueDate: "2024-11-15", createdAt: "2024-11-01" },
  { id: 6, title: "Site Safety Audit", description: "Monthly safety inspection", projectId: 2, assigneeId: 4, priority: "medium", status: "inprogress", dueDate: "2024-12-22", createdAt: "2024-12-10" },
  { id: 7, title: "Concrete Pouring - Roof", description: "Roof slab concrete pour", projectId: 1, assigneeId: 3, priority: "high", status: "todo", dueDate: "2024-12-30", createdAt: "2024-12-08" },
  { id: 8, title: "Paint Estimation", description: "Get quotes from 3 vendors", projectId: 2, assigneeId: 4, priority: "low", status: "todo", dueDate: "2025-01-10", createdAt: "2024-12-09" },
  { id: 9, title: "Window Frame Installation", description: "Install 48 window frames Floor 1-4", projectId: 1, assigneeId: 3, priority: "medium", status: "inprogress", dueDate: "2024-12-28", createdAt: "2024-12-05" },
  { id: 10, title: "MEP Coordination Meeting", description: "Coordinate with MEP consultant", projectId: 2, assigneeId: 4, priority: "high", status: "review", dueDate: "2024-12-19", createdAt: "2024-12-11" },
  { id: 11, title: "Brick Masonry - Floor 5", description: "Complete masonry for Floor 5", projectId: 1, assigneeId: 3, priority: "medium", status: "todo", dueDate: "2025-01-05", createdAt: "2024-12-10" },
  { id: 12, title: "Flooring Work - Ground Floor", description: "Marble flooring in lobby", projectId: 2, assigneeId: 5, priority: "low", status: "todo", dueDate: "2025-01-15", createdAt: "2024-12-12" },
  { id: 13, title: "Elevator Shaft Shuttering", description: "Shuttering for both elevator shafts", projectId: 1, assigneeId: 3, priority: "high", status: "inprogress", dueDate: "2024-12-25", createdAt: "2024-12-11" },
  { id: 14, title: "HVAC Ducting Layout", description: "Finalize ducting layout with consultant", projectId: 4, assigneeId: 5, priority: "medium", status: "todo", dueDate: "2024-12-20", createdAt: "2024-12-12" },
  { id: 15, title: "Boundary Wall Plaster", description: "Plastering of 200m boundary wall", projectId: 2, assigneeId: 3, priority: "low", status: "todo", dueDate: "2025-01-05", createdAt: "2024-12-13" },
];

// Daily Logs
export const DAILY_LOGS = [
  {
    id: 1, projectId: 1, date: "2024-12-10", weather: "Sunny",
    labor: [{ name: "Ravi Singh", role: "Mason", count: 5, hours: 8 }, { name: "Mohan Das", role: "Carpenter", count: 3, hours: 8 }],
    equipment: [{ name: "Tower Crane", hours: 6, operator: "Ram Lal" }, { name: "Concrete Mixer", hours: 4, operator: "Shyam" }],
    materials: [{ name: "Cement", quantity: 120, unit: "Bags" }, { name: "Sand", quantity: 200, unit: "CuFt" }],
    notes: "Good progress on Floor 3. No safety incidents.", photos: [], createdBy: 2,
  },
  {
    id: 2, projectId: 1, date: "2024-12-09", weather: "Cloudy",
    labor: [{ name: "Anil Verma", role: "Helper", count: 8, hours: 8 }, { name: "Vijay Nair", role: "Painter", count: 2, hours: 7 }],
    equipment: [{ name: "Scaffolding", hours: 8, operator: "N/A" }],
    materials: [{ name: "TMT Steel", quantity: 500, unit: "Kg" }],
    notes: "Concrete curing on schedule. Light cloud cover – no delays.", photos: [], createdBy: 2,
  },
  {
    id: 3, projectId: 1, date: "2024-12-08", weather: "Rainy",
    labor: [{ name: "Ravi Singh", role: "Mason", count: 3, hours: 6 }, { name: "Mohan Das", role: "Carpenter", count: 2, hours: 5 }],
    equipment: [],
    materials: [{ name: "Cement", quantity: 60, unit: "Bags" }],
    notes: "Work halted at noon due to rain. Safety precautions taken.", photos: [], createdBy: 2,
  },
  {
    id: 4, projectId: 1, date: "2024-12-07", weather: "Sunny",
    labor: [{ name: "Ravi Singh", role: "Mason", count: 6, hours: 8 }, { name: "Vijay Nair", role: "Painter", count: 4, hours: 8 }],
    equipment: [{ name: "Tower Crane", hours: 8, operator: "Ram Lal" }],
    materials: [{ name: "Cement", quantity: 150, unit: "Bags" }, { name: "Coarse Aggregate", quantity: 300, unit: "CuFt" }],
    notes: "Highly productive day. Floor 3 shuttering 80% complete.", photos: [], createdBy: 2,
  },
  {
    id: 5, projectId: 1, date: "2024-12-06", weather: "Sunny",
    labor: [{ name: "Anil Verma", role: "Helper", count: 10, hours: 8 }],
    equipment: [{ name: "Concrete Mixer", hours: 7, operator: "Shyam" }],
    materials: [{ name: "Sand", quantity: 250, unit: "CuFt" }, { name: "TMT Steel", quantity: 800, unit: "Kg" }],
    notes: "Steel cage work completed for columns.", photos: [], createdBy: 2,
  },
  {
    id: 6, projectId: 1, date: "2024-12-05", weather: "Windy",
    labor: [{ name: "Ravi Singh", role: "Mason", count: 4, hours: 7 }],
    equipment: [],
    materials: [{ name: "Cement", quantity: 80, unit: "Bags" }],
    notes: "High winds – crane operations suspended. Masonry work continued.", photos: [], createdBy: 2,
  },
  {
    id: 7, projectId: 1, date: "2024-12-04", weather: "Sunny",
    labor: [{ name: "Mohan Das", role: "Carpenter", count: 5, hours: 8 }, { name: "Vijay Nair", role: "Painter", count: 3, hours: 8 }],
    equipment: [{ name: "Tower Crane", hours: 5, operator: "Ram Lal" }],
    materials: [{ name: "TMT Steel", quantity: 600, unit: "Kg" }, { name: "Coarse Aggregate", quantity: 200, unit: "CuFt" }],
    notes: "Materials delivered on time. High productivity.", photos: [], createdBy: 2,
  },
  {
    id: 8, projectId: 2, date: "2024-12-10", weather: "Sunny",
    labor: [{ name: "Prakash Yadav", role: "Electrician", count: 4, hours: 8 }],
    equipment: [{ name: "Drilling Machine", hours: 5, operator: "Prakash" }],
    materials: [{ name: "PVC Pipes", quantity: 50, unit: "Meters" }],
    notes: "Electrical conduit laying started in Block B.", photos: [], createdBy: 4,
  },
  {
    id: 9, projectId: 4, date: "2024-12-10", weather: "Clear",
    labor: [{ name: "Manoj Singh", role: "Carpenter", count: 2, hours: 8 }],
    equipment: [],
    materials: [{ name: "Plywood", quantity: 20, unit: "Sheets" }],
    notes: "Site mobilization and temporary storage setup.", photos: [], createdBy: 2,
  },
];

// Helper to generate attendance data
function generateAttendanceData() {
  const records = [];
  const statuses = ["present", "present", "present", "present", "present", "present", "present", "present", "absent", "halfday"];
  const today = new Date("2024-12-10");
  let id = 1;
  WORKERS.forEach((worker) => {
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const rand = Math.random();
      let status;
      if (rand < 0.75) status = "present";
      else if (rand < 0.87) status = "absent";
      else if (rand < 0.93) status = "halfday";
      else status = "leave";
      records.push({ id: id++, workerId: worker.id, date: dateStr, status });
    }
  });
  return records;
}

export const ATTENDANCE = generateAttendanceData();

// Materials
export const MATERIALS = [
  { id: 1, projectId: 1, name: "Cement (OPC 53)", unit: "Bags", ordered: 5000, received: 4200, used: 3800, unitPrice: 380, alertLevel: 300 },
  { id: 2, projectId: 1, name: "TMT Steel Bars", unit: "Kg", ordered: 50000, received: 48000, used: 45000, unitPrice: 68, alertLevel: 2000 },
  { id: 3, projectId: 1, name: "River Sand", unit: "CuFt", ordered: 8000, received: 7500, used: 7200, unitPrice: 45, alertLevel: 500 },
  { id: 4, projectId: 1, name: "Coarse Aggregate", unit: "CuFt", ordered: 10000, received: 9000, used: 8500, unitPrice: 38, alertLevel: 400 },
  { id: 5, projectId: 2, name: "Bricks (Red)", unit: "Nos", ordered: 200000, received: 180000, used: 175000, unitPrice: 8, alertLevel: 5000 },
  { id: 6, projectId: 2, name: "Ceramic Tiles", unit: "SqFt", ordered: 15000, received: 12000, used: 8000, unitPrice: 55, alertLevel: 1000 },
  { id: 7, projectId: 2, name: "PVC Pipes (4 inch)", unit: "Meters", ordered: 2000, received: 1800, used: 1750, unitPrice: 120, alertLevel: 100 },
  { id: 8, projectId: 2, name: "Paint (White)", unit: "Liters", ordered: 3000, received: 2800, used: 2750, unitPrice: 95, alertLevel: 200 },
  { id: 9, projectId: 1, name: "Aggregate 20mm", unit: "CuFt", ordered: 15000, received: 14000, used: 13000, unitPrice: 35, alertLevel: 500 },
  { id: 10, projectId: 4, name: "Steel Stirrups", unit: "Kg", ordered: 10000, received: 5000, used: 2000, unitPrice: 72, alertLevel: 1000 },
  { id: 11, projectId: 2, name: "Plaster Sand", unit: "CuFt", ordered: 5000, received: 4500, used: 4000, unitPrice: 42, alertLevel: 300 },
  { id: 12, projectId: 1, name: "White Cement", unit: "Bags", ordered: 200, received: 180, used: 50, unitPrice: 850, alertLevel: 20 },
];

// Notifications
export const NOTIFICATIONS = [
  { id: 1, type: "warning", title: "Low Stock Alert", message: "Cement stock below minimum level in Tower A", time: "2 hours ago", read: false },
  { id: 2, type: "task", title: "Task Due Tomorrow", message: "Column Shuttering - Floor 3 is due tomorrow", time: "5 hours ago", read: false },
  { id: 3, type: "attendance", title: "Attendance Pending", message: "Mark attendance for today - 12 workers pending", time: "8 hours ago", read: false },
  { id: 4, type: "info", title: "Project Update", message: "Commercial Plaza reached 28% completion", time: "1 day ago", read: true },
  { id: 5, type: "success", title: "Task Completed", message: "Foundation Inspection marked as complete", time: "2 days ago", read: true },
];

// Activity Feed
export const ACTIVITIES = [
  { id: 1, icon: "check", description: "Foundation Inspection marked as Done", time: "2 hours ago", user: "Suresh Patel" },
  { id: 2, icon: "log", description: "Daily Log added for Residential Tower A", time: "4 hours ago", user: "Amit Sharma" },
  { id: 3, icon: "attendance", description: "Attendance marked for 24 workers", time: "8 hours ago", user: "Amit Sharma" },
  { id: 4, icon: "material", description: "Cement delivery received - 500 bags", time: "1 day ago", user: "Kiran Patil" },
  { id: 5, icon: "task", description: "New task added: Concrete Pouring - Roof", time: "2 days ago", user: "Amit Sharma" },
];

export const PROJECTS_FILES = [
  { id: 1, name: 'Structural_Blueprint_V2.pdf', type: 'image', size: '12.4 MB', category: 'Blueprint', uploadedBy: 'Amit Sharma', date: '2024-12-01', previewUrl: 'file:///Users/yuvrajsingh/.gemini/antigravity/brain/3b761094-d49b-4ff6-948f-2b1543f72f06/architectural_blueprint_preview_1773122651233.png' },
  { id: 2, name: 'Site_Inspection_Photos.zip', type: 'image', size: '45.8 MB', category: 'Photos', uploadedBy: 'Suresh Patel', date: '2024-12-05', previewUrl: 'file:///Users/yuvrajsingh/.gemini/antigravity/brain/3b761094-d49b-4ff6-948f-2b1543f72f06/construction_site_inspection_photo_1773122631587.png' },
  { id: 3, name: 'Material_Invoice_Dec.pdf', type: 'image', size: '1.2 MB', category: 'Invoice', uploadedBy: 'Vikram Singh', date: '2024-12-08', previewUrl: 'file:///Users/yuvrajsingh/.gemini/antigravity/brain/3b761094-d49b-4ff6-948f-2b1543f72f06/construction_invoice_placeholder_1773122669016.png' },
  { id: 4, name: 'Safety_Guidelines_2024.pdf', type: 'pdf', size: '2.5 MB', category: 'Compliance', uploadedBy: 'Rajesh Kumar', date: '2024-11-15' },
  { id: 5, name: 'Project_Schedule_Tower_A.xlsx', type: 'excel', size: '850 KB', category: 'Planning', uploadedBy: 'Amit Sharma', date: '2024-12-10' },
];

export const LOGISTICS = [
  { id: 1, machineName: "Excavator CAT 320", fromProjectId: 1, toProjectId: 2, departureDate: "2024-12-10", eta: "2024-12-11", status: "in-transit", notes: "Moving for foundation work at Plaza" },
  { id: 2, machineName: "Tower Crane TC-1", fromProjectId: 3, toProjectId: 1, departureDate: "2024-11-25", eta: "2024-11-26", status: "arrived", notes: "Dismantled and moved to Tower A" },
  { id: 3, machineName: "Concrete Mixer Truck", fromProjectId: 2, toProjectId: 4, departureDate: "2024-12-08", eta: "2024-12-08", status: "arrived", notes: "Urgent pour required at Metro Station" },
];

export const EQUIPMENT_TYPES = [
  "Excavator", "Tower Crane", "Concrete Mixer", "JCB", "Dumper Truck", 
  "Roller", "Generator Set", "Scaffolding Set", "Drilling Rig"
];

export const COMMON_MATERIALS = [
  "Cement (OPC 53)", "Cement (PPC)", "White Cement",
  "TMT Steel Bars (8mm)", "TMT Steel Bars (10mm)", "TMT Steel Bars (12mm)", "TMT Steel Bars (16mm)",
  "River Sand", "Crushed Sand", "Plaster Sand",
  "Aggregate 10mm", "Aggregate 20mm", "Aggregate 40mm",
  "Red Bricks", "Fly Ash Bricks", "AAC Blocks",
  "Ready Mix Concrete (M20)", "Ready Mix Concrete (M25)", "Ready Mix Concrete (M30)",
  "PVC Pipes (2 inch)", "PVC Pipes (4 inch)", "SWR Pipes",
  "Paints (Internal - White)", "Paints (External)", "Wall Primer",
  "Ceramic Tiles", "Vitrified Tiles", "Granite", "Marble",
  "Structural Steel", "Binding Wire", "Scaffolding Tubes"
];
