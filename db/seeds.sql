DO $$
BEGIN
    
    INSERT INTO department (name) VALUES
    ('Human Resources'),
    ('Engineering'),
    ('Sales'),
    ('Marketing');

    INSERT INTO role (title, salary, department_id) VALUES
    ('HR Manager', 60000, 1),
    ('Software Engineer', 80000, 2),
    ('Sales Associate', 50000, 3),
    ('Marketing Specialist', 55000, 4);

    INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
    ('Bob', 'Vila', 1, NULL),
    ('Sarah', 'Connor', 2, 1),
    ('Micheal', 'Jordon', 3, 1),
    ('Steve', 'Buscemi', 4, 2);

    RAISE NOTICE 'Transaction complete';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'An error occurred: %', SQLERRM; 
END $$;