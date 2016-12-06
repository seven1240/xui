content_type("application/json")
require 'xdb'
xdb.bind(xtra.dbh)

get('/', function(params)
	local tabs = {}
	local tab = {id= 1, realm = 'name',key = 'key1'}

	table.insert(tabs, tab)

	tab = {id= 2,realm = 'name2', key = 'name'}
	table.insert(tabs, tab)

	tab = {id= 3, value = 'name'}
	table.insert(tabs, tab)

	return tabs
end)

get('/:id', function(params)
	local tab = {id= params.id}
	return tab
end)

put('/:id', function(params)
	print(serialize(params))
	ret = xdb.update("dicts", params.request)
	if ret then
		return 200, "{}"
	else
		return 500
	end
end)



post('/', function(params)
	print(serialize(params))

	ret = xdb.create('dicts', params.request)

	if ret == 1 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)

delete('/:id', function(params)
	ret = xdb.delete("dicts", params.id);

	if ret == 1 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)













