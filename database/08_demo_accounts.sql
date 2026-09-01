-- Development-only accounts. Every hash below is bcrypt for the password: password
INSERT ALL
 INTO SYSTEM_USER VALUES ('U001','P001','admin','$2b$10$epynEfs4psB00OHzoxOiH.V9QkT5PaOlBozO1NBbo8UzYv4CZwQD.','ADMIN','ACTIVE')
 INTO SYSTEM_USER VALUES ('U002','P002','employee','$2b$10$XvuglmNy0ZDhJsIFklbgXOPFEEewtTXXNyKgstByzx0wg86mHrQm.','EMPLOYEE','ACTIVE')
 INTO SYSTEM_USER VALUES ('U003','P003','doctor','$2b$10$nTWTsY3VXS3r5WUQBUQnPOd/tyLq5qrYU9xFgMcqX9lRBi2K60ibu','DOCTOR','ACTIVE')
 INTO SYSTEM_USER VALUES ('U004','P013','supervisor','$2b$10$NEOcrB1nI0uapYfoHkkppukLrVSYIawwFtaY7KRf3vlIPuwmo/XTq','SUPERVISOR','ACTIVE')
 INTO SYSTEM_USER VALUES ('U005','P016','adopter','$2b$10$O3j/sb0rvbBQfChhT/tNbelHt/rRN6/1hNezXQHf8SQ0aPeQHaRzm','ADOPTER','ACTIVE')
SELECT 1 FROM DUAL;
COMMIT;
