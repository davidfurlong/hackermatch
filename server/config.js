ServiceConfiguration.configurations.remove({
    service : 'github'
});

// REMOTE VERSION

// ServiceConfiguration.configurations.insert({
//     service : 'github',
//     clientId: 'b04325d8189b5abd4358',
//     secret  : '88f6cc75ef929df9406290194e700cb18ce2577b'
// });

// LOCAL VERSION
ServiceConfiguration.configurations.insert({
    service : 'github',
	//localhost
	//    clientId: '6b42c70ff19b12a4e835',
	//    secret  : '58bb8fc7b6d71ccade75f520b222efa67b26a49e'
	//live - hacker.dating
    // clientId: 'b04325d8189b5abd4358',
    // secret  : '88f6cc75ef929df9406290194e700cb18ce2577b'
	//david localhost, though other localhost will work
   	clientId: '191ae17422ad5a993ca3',
   	secret  : 'e067a8a9ccdc7c9dd29667895f81f88cdd40ff0a'
});
