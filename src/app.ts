import inquirer from 'inquirer';
import pkg from 'pg';
const { Client } = pkg;

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    role_id: number;
    manager_id: number | null;
}

interface Role {
    id: number;
    title: string;
}

interface Department {
    id: number;
    name: string;
}

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'employeetracker',
    password: 'Password',
    port: 5432,
});

client.connect()
    .then(() => console.log('Connected to the database'))
    .catch(err => console.error('Connection error', err.stack));

    const promptUser = () => {
        
        inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    'View all employees',
                    'View all roles',
                    'Add an employee',
                    'Update an employee role',
                    'View all departments',
                    'Exit'
                ],
            },
        ]).then((answers) => {
            switch (answers.action) {   
                case 'View all employees':
                    viewAllEmployees();
                    break;
                case 'View all roles':
                    viewAllRole();
                    break;    
                case 'Add an employee':
                    addEmployee();
                    break;
                case 'Update an employee role':
                    updateEmployeeRole();
                    break;
                case 'View all departments':
                    viewAllDepartments();
                    break;
                case 'Exit':
                    client.end();
                    break;
            }
        });
    };

const viewAllEmployees = () => {
    client.query<Employee>('SELECT * FROM employee', (err: Error | null, res: { rows: Employee[] }) => {
        if (err) throw err;
        console.table(res.rows);
        promptUser();
    });
};

const viewAllDepartments = () => {
    client.query<Department>('SELECT * FROM department', (err: Error | null, res: { rows: Department[] }) => {
        if (err) throw err;
        console.table(res.rows);
        promptUser();
    });
};

const viewAllRole = () => {
    client.query<Role>('SELECT * FROM department', (err: Error | null, res: { rows: Role[] }) => {
        if (err) throw err;
        console.table(res.rows);
        promptUser();
    });
};

const addEmployee = async () => {
    const roles = await client.query<Role>('SELECT * FROM role');
    const roleChoices = roles.rows.map((role: Role) => ({ name: role.title, value: role.id }));

    const departments = await client.query<Department>('SELECT * FROM department');
    const departmentChoices = departments.rows.map((dept: Department) => ({ name: dept.name, value: dept.id }));

    inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: 'Enter the first name of the employee:',
        },
        {
            type: 'input',
            name: 'last_name',
            message: 'Enter the last name of the employee:',
        },
        {
            type: 'list',
            name: 'role_id',
            message: 'Select the role of the employee:',
            choices: roleChoices,
        },
        {
            type: 'list',
            name: 'department_id',
            message: 'Select the department of the employee:',
            choices: departmentChoices,
        },
        {
            type: 'input',
            name: 'manager_id',
            message: 'Enter the manager ID (leave blank if none):',
            default: '',
        },
    ]).then((answers: { first_name: string, last_name: string, role_id: number, department_id: number, manager_id: string }) => {
        const { first_name, last_name, role_id, department_id, manager_id } = answers;

        client.query('INSERT INTO employee (first_name, last_name, role_id, department_id, manager_id) VALUES ($1, $2, $3, $4, $5)', 
            [first_name, last_name, role_id, department_id, manager_id ? parseInt(manager_id) : null], 
            (err: Error | null) => {
                if (err) throw err;
                console.log('Employee added successfully!');
                promptUser();
            });
    });
};

const updateEmployeeRole = async () => {
    
    const employees = await client.query<Employee>('SELECT * FROM employee');
    const employeeChoices = employees.rows.map((emp: Employee) => ({
        name: `${emp.first_name} ${emp.last_name}`, 
        value: emp.id, 
    }));

    const roles = await client.query<Role>('SELECT * FROM role');
    const roleChoices = roles.rows.map((role: Role) => ({
        name: role.title,
        value: role.id,
    }));

    inquirer.prompt([
        {
            type: 'list',
            name: 'employee_id',
            message: 'Select the employee whose role you want to update:',
            choices: employeeChoices,
        },
        {
            type: 'list',
            name: 'new_role_id',
            message: 'Select the new role for the employee:',
            choices: roleChoices,
        },
    ]).then((answers: { employee_id: number, new_role_id: number }) => {
        const { employee_id, new_role_id } = answers;

        
        client.query(
            'UPDATE employee SET role_id = $1 WHERE id = $2',
            [new_role_id, employee_id],
            (err: Error | null) => {
                if (err) throw err;
                console.log('Employee role updated successfully!');
                promptUser();
            }
        );
    });
};

promptUser();