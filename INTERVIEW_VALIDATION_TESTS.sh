#!/bin/bash

# 🔒 Interview Validation Testing - Curl Commands
# Copy and paste these commands to test the interview validation system

# Set these variables before running
API_URL="http://localhost:3000"
USER_TOKEN="your_user_token_here"
ADMIN_TOKEN="your_admin_token_here"
USER_ID="user_id_here"
DOCUMENT_ID="document_id_here"

echo "================================"
echo "🔒 Interview Validation Test Suite"
echo "================================"
echo ""
echo "Update the variables at the top of this script before running!"
echo "API_URL: $API_URL"
echo "USER_TOKEN: ${USER_TOKEN:0:20}..."
echo "ADMIN_TOKEN: ${ADMIN_TOKEN:0:20}..."
echo ""

# ============================================================
# SECTION 1: USER - Check Interview Eligibility
# ============================================================

echo ""
echo "========== TEST 1: Check Interview Eligibility =========="
echo "GET /api/interview/schedule"
echo ""

curl -X GET "$API_URL/api/interview/schedule" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""

# ============================================================
# SECTION 2: USER - Upload Document (PDF)
# ============================================================

echo ""
echo "========== TEST 2: Upload Document (PDF) =========="
echo "POST /api/documents"
echo ""
echo "Note: Replace 'passport.pdf' with actual PDF file path"
echo ""

# Example - comment out if no test file available
# curl -X POST "$API_URL/api/documents" \
#   -H "Authorization: Bearer $USER_TOKEN" \
#   -F "file=@passport.pdf" \
#   -F "type=passport" \
#   -w "\nHTTP Status: %{http_code}\n"

echo "Skipped - provide actual PDF file"
echo ""

# ============================================================
# SECTION 3: USER - Try Upload Non-PDF (Should Fail)
# ============================================================

echo ""
echo "========== TEST 3: Try Upload JPG (Should Fail) =========="
echo "POST /api/documents (with JPG file)"
echo ""
echo "Note: This should return 400 - Only PDF files allowed"
echo ""

# Example - comment out if no test file available
# curl -X POST "$API_URL/api/documents" \
#   -H "Authorization: Bearer $USER_TOKEN" \
#   -F "file=@photo.jpg" \
#   -F "type=passport" \
#   -w "\nHTTP Status: %{http_code}\n"

echo "Skipped - provide actual JPG file"
echo ""

# ============================================================
# SECTION 4: USER - Get User's Documents
# ============================================================

echo ""
echo "========== TEST 4: Get User's Documents =========="
echo "GET /api/documents"
echo ""

curl -X GET "$API_URL/api/documents" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""

# ============================================================
# SECTION 5: ADMIN - Review Document (Approve)
# ============================================================

echo ""
echo "========== TEST 5: Admin - Approve Document =========="
echo "PUT /api/documents?action=review"
echo ""
echo "Note: Update DOCUMENT_ID with actual document ID"
echo ""

curl -X PUT "$API_URL/api/documents?action=review" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"documentId\": \"$DOCUMENT_ID\",
    \"status\": \"approved\"
  }" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""

# ============================================================
# SECTION 6: ADMIN - Review Document (Reject)
# ============================================================

echo ""
echo "========== TEST 6: Admin - Reject Document =========="
echo "PUT /api/documents?action=review"
echo ""

curl -X PUT "$API_URL/api/documents?action=review" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"documentId\": \"$DOCUMENT_ID\",
    \"status\": \"rejected\",
    \"rejectionReason\": \"Photo too blurry, please resubmit\"
  }" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""

# ============================================================
# SECTION 7: USER - Try Schedule Interview (No Documents - Should Fail)
# ============================================================

echo ""
echo "========== TEST 7: Schedule Interview (No Documents - Should FAIL 403) =========="
echo "POST /api/interview/schedule"
echo ""

curl -X POST "$API_URL/api/interview/schedule" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"scheduled_at\": \"2024-02-15T10:00:00Z\",
    \"type\": \"video\",
    \"mode\": \"online\"
  }" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "Expected: 403 Forbidden with message about completing documents"
echo ""

# ============================================================
# SECTION 8: USER - Try Schedule Interview (Pending Documents - Should Fail)
# ============================================================

echo ""
echo "========== TEST 8: Schedule Interview (Pending Documents - Should FAIL 403) =========="
echo "POST /api/interview/schedule"
echo ""
echo "Note: This assumes you have uploaded documents but admin hasn't approved yet"
echo ""

curl -X POST "$API_URL/api/interview/schedule" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"scheduled_at\": \"2024-02-15T10:00:00Z\",
    \"type\": \"video\",
    \"mode\": \"online\",
    \"notes\": \"Optional notes for interviewer\"
  }" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "Expected: 403 Forbidden with pending document details"
echo ""

# ============================================================
# SECTION 9: USER - Schedule Interview (All Approved - Should Succeed)
# ============================================================

echo ""
echo "========== TEST 9: Schedule Interview (All Approved - Should SUCCEED 201) =========="
echo "POST /api/interview/schedule"
echo ""
echo "Note: This only works if ALL documents are approved"
echo ""

curl -X POST "$API_URL/api/interview/schedule" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"scheduled_at\": \"2024-02-15T10:00:00Z\",
    \"type\": \"video\",
    \"mode\": \"online\",
    \"notes\": \"Looking forward to the interview\"
  }" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "Expected: 201 Created with interview details"
echo ""

# ============================================================
# SECTION 10: ADMIN - Get All Documents
# ============================================================

echo ""
echo "========== TEST 10: Admin - Get All Documents =========="
echo "GET /api/admin/documents?action=documents"
echo ""

curl -X GET "$API_URL/api/admin/documents?action=documents" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""

# ============================================================
# SECTION 11: ADMIN - Get All Applications
# ============================================================

echo ""
echo "========== TEST 11: Admin - Get All Applications =========="
echo "GET /api/admin/documents?action=applications"
echo ""

curl -X GET "$API_URL/api/admin/documents?action=applications" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""

# ============================================================
# SECTION 12: ADMIN - Get User Details
# ============================================================

echo ""
echo "========== TEST 12: Admin - Get User Details =========="
echo "GET /api/admin/documents?action=user&userId=$USER_ID"
echo ""

curl -X GET "$API_URL/api/admin/documents?action=user&userId=$USER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""

# ============================================================
# SECTION 13: ADMIN - Check Interview Eligibility for User
# ============================================================

echo ""
echo "========== TEST 13: Admin - Check Interview Eligibility =========="
echo "GET /api/admin/documents?action=eligibility&userId=$USER_ID"
echo ""

curl -X GET "$API_URL/api/admin/documents?action=eligibility&userId=$USER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""

# ============================================================
# SECTION 14: ADMIN - Filter Documents by Status
# ============================================================

echo ""
echo "========== TEST 14: Admin - Get Pending Documents =========="
echo "GET /api/admin/documents?action=documents&status=pending"
echo ""

curl -X GET "$API_URL/api/admin/documents?action=documents&status=pending" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""

# ============================================================
# SECTION 15: ADMIN - Bulk Review Documents
# ============================================================

echo ""
echo "========== TEST 15: Admin - Bulk Approve Documents =========="
echo "PUT /api/admin/documents?action=bulk-review"
echo ""
echo "Note: Update document IDs list with actual IDs"
echo ""

curl -X PUT "$API_URL/api/admin/documents?action=bulk-review" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"documentIds\": [\"$DOCUMENT_ID\"],
    \"status\": \"approved\"
  }" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""

# ============================================================
# SECTION 16: Error Cases - Invalid Interview Date
# ============================================================

echo ""
echo "========== TEST 16: Schedule Interview in Past (Should FAIL 400) =========="
echo "POST /api/interview/schedule"
echo ""

curl -X POST "$API_URL/api/interview/schedule" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"scheduled_at\": \"2020-01-01T10:00:00Z\",
    \"type\": \"video\",
    \"mode\": \"online\"
  }" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "Expected: 400 Bad Request - Interview date must be in the future"
echo ""

# ============================================================
# SECTION 17: Error Cases - Invalid Interview Type
# ============================================================

echo ""
echo "========== TEST 17: Schedule Interview Invalid Type (Should FAIL 400) =========="
echo "POST /api/interview/schedule"
echo ""

curl -X POST "$API_URL/api/interview/schedule" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"scheduled_at\": \"2024-02-15T10:00:00Z\",
    \"type\": \"invalid_type\",
    \"mode\": \"online\"
  }" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "Expected: 400 Bad Request - Invalid interview type"
echo ""

# ============================================================
# SUMMARY
# ============================================================

echo ""
echo "========== TEST SUMMARY =========="
echo ""
echo "✅ Basic Workflow (Tests 1-9):"
echo "   1. Check eligibility (expect: canScheduleInterview=false)"
echo "   2. Upload documents"
echo "   4. Get documents (expect: status=pending)"
echo "   5. Admin approves"
echo "   7-8. Try schedule (expect: 403 Forbidden)"
echo "   9. Once approved, schedule (expect: 201 Created)"
echo ""
echo "✅ Admin Operations (Tests 10-15):"
echo "   10. View all documents"
echo "   11. View all applications"
echo "   12. Check specific user"
echo "   13. Check user eligibility"
echo "   14. Filter by status"
echo "   15. Bulk operations"
echo ""
echo "✅ Error Cases (Tests 16-17):"
echo "   16. Invalid date (past)"
echo "   17. Invalid type"
echo ""
echo "==============================="
echo ""
