# Frontend-Backend Integration Status & Requirements

## Current Situation 现状总结

Frontend开发已完成，UI看起来functional，但实际上大部分核心功能都在显示mock data，因为backend缺少关键endpoints。用户能login、看到漂亮的界面，但无法真正创建health records或medical record requests。

## Four Critical Issues 四个关键问题

### 1. Health Records Creation Blocked ❌
**问题：**
- Frontend需要显示dropdown让用户选择疾病/药物/化验项目
- 每个选项都需要backend提供的valid UUID
- Backend没有提供list endpoints来获取这些选项
- 结果：用户完全无法添加任何健康记录

**Frontend已经准备好的代码：**
```javascript
// src/services/api.js line 461
async getDiseaseFacts() {
  const response = await apiClient.get(API_ENDPOINTS.DISEASE_FACTS);
  return response.data;
}
```

**Backend需要提供：**
- `GET /health-data/disease-facts` - 返回所有疾病列表
- `GET /health-data/medication-facts` - 返回所有药物列表
- `GET /health-data/lab-facts` - 返回所有化验项目列表
- `GET /health-data/vital-facts` - 返回所有生命体征类型列表

**Expected Response Format:**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "name": "Type 2 Diabetes",
    "code": "E11.9"
  },
  ...
]
```

### 2. Medical Record Requests Can't Be Created ❌
**问题：**
- Backend只有READ endpoints（需要已存在的batch_id）
- 没有CREATE endpoint来创建新request
- 没有LIST endpoint来查看所有requests
- 结果：核心功能完全是假的，只显示hardcoded data

**Frontend已经准备好的代码：**
```javascript
// src/services/requestService.production.js
async createRequest(requestData) {
  // Ready to POST to /request-batches when available
}
```

**Backend需要提供：**
- `POST /request-batches` - 创建新request
- `GET /request-batches` - 列出用户的所有requests
- `PUT /request-batches/{id}` - 更新request状态（可选）
- `DELETE /request-batches/{id}` - 删除request（可选）

**Good News:** Tracking endpoints都已经ready（timeline、documents、notes等），只要能创建request就能用。

### 3. Provider Directory Missing ⚠️
**问题：**
- `GET /provider`只返回用户自己添加的providers
- 没有public provider database可以搜索
- 结果：用户必须手动添加每个医生，体验很差

**Backend需要提供：**
- 建立provider database
- `GET /provider/search` - 搜索所有available providers

### 4. Profile Update Returns 500 Error ❌
**问题：**
- `PUT /profile/me`总是返回500 Internal Server Error
- Frontend发送的格式完全正确，所有空值都用`null`
- 即使最简单的payload也失败
- 结果：用户无法更新任何profile信息

**Frontend发送的实际数据（格式正确）：**
```json
{
  "email": "megumin82078@gmail.com",
  "profile_json": {
    "name": "megumin82078 W",
    "phone": null,
    "date_of_birth": null,
    "sex": null,
    "blood_type": null,
    "height": null,
    "weight": null,
    "allergies": null,
    "current_medications": null,
    "medical_conditions": null,
    "emergency_contact_name": null,
    "emergency_contact_phone": null,
    "emergency_contact_relationship": null,
    "primary_physician_name": null,
    "primary_physician_phone": null
  }
}
```

**Backend需要fix：**
- 修复`PUT /profile/me` endpoint的500错误
- 确保能正确处理null值
- 返回更新后的user profile

## Priority & Impact 优先级和影响

### 🚨 URGENT（核心功能blocked）
1. **Health Facts Endpoints** - 不fix用户无法添加任何健康数据
2. **Request Batch CREATE/LIST** - 不fix主要功能完全无法使用
3. **Profile Update 500 Error** - 不fix用户无法更新任何个人信息

### ⚠️ HIGH（用户体验问题）
1. **Provider Directory** - 影响用户体验但不blocking

## What's Working ✅
- Authentication (login/signup)
- Provider CRUD (create/read/update/delete自己的providers)
- Profile viewing（但不能update因为500 error）
- Request tracking endpoints（但没有request可以track）

## Frontend Implementation Status

### Ready to Connect 已准备好连接：
1. **Health Records Forms** - 所有表单ready，等待facts endpoints
2. **Request Creation Flow** - UI完成，等待POST endpoint
3. **Tracking Pages** - 完整实现，已经在尝试fetch真实数据
4. **Error Handling** - 有完整的fallback到mock data

### Code Locations 代码位置：
- API Service: `src/services/api.js`
- Request Service: `src/services/requestService.js`
- Health Record Pages: `src/pages/health-records/*`
- Request Pages: `src/pages/requests/*`

## Next Steps When Backend Ready

当backend准备好后，frontend只需要：

1. **Remove Mock Data Fallbacks**
   - 删除`getDiseaseFacts()`等函数中的mock data
   - 删除requestService中的mock responses

2. **Test Real Data Flow**
   - 确认UUID格式匹配
   - 验证所有required fields
   - 检查error handling

3. **Quick Testing Checklist**
   ```
   ✓ Can fetch disease/medication/lab/vital facts?
   ✓ Can create health records with real UUIDs?
   ✓ Can create new request batch?
   ✓ Can list all user's requests?
   ✓ Can track request progress?
   ```

## Additional Notes

- Frontend使用axios with interceptors，自动处理auth tokens
- 所有API calls都有proper error handling和loading states
- Mock data使用valid UUID format，应该seamlessly切换到real data
- Environment variable `VITE_USE_PRODUCTION_API`控制是否使用mock

---

**Status:** Waiting for backend to implement missing endpoints. Frontend fully ready to integrate.
