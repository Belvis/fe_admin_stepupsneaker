import { newModel, StringAdapter } from "casbin";

export const model = newModel(`
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act, eft

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow)) && !some(where (p.eft == deny))

[matchers]
m = g(r.sub, p.sub) && keyMatch(r.obj, p.obj) && regexMatch(r.act, p.act)
`);

export const adapter = new StringAdapter(`
p, ROLE_ADMIN, *, (list)|(create)|(edit)|(show)|(delete)

p, ROLE_STAFF, customers, (list)|(create)
p, ROLE_STAFF, customers/*, (edit)|(show)

p, ROLE_STAFF, orders, (list)
p, ROLE_STAFF, orders/*, (edit)|(show)

p, ROLE_STAFF, pos, (list)

p, ROLE_STAFF, dashboard, (list)

p, ROLE_STAFF, payments, (list)

p, ROLE_STAFF, return-forms, (list)|(create)
p, ROLE_STAFF, return-forms/*, (edit)

`);
