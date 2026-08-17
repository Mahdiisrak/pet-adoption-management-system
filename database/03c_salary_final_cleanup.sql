SET SERVEROUTPUT ON;

DECLARE
    v_count NUMBER;
BEGIN
    FOR t IN (
        SELECT table_name
        FROM user_tables
        WHERE table_name NOT LIKE 'BK%'
        ORDER BY table_name
    )
    LOOP
        EXECUTE IMMEDIATE
            'SELECT COUNT(*) FROM "' || t.table_name || '"'
            INTO v_count;

        DBMS_OUTPUT.PUT_LINE(
            RPAD(t.table_name, 25) || ' : ' || v_count
        );
    END LOOP;
END;
/