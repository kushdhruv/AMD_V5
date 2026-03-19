import 'package:flutter/material.dart';
import '../theme.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Admin Dashboard')),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: Supabase.instance.client
            .from('registrations')
            .select()
            .eq('app_name', 'Smart Registration Helper') 
            .limit(50)
            .order('created_at', ascending: false),
        builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError) {
                return Center(child: Text('Error: ${snapshot.error}'));
            }
            if (!snapshot.hasData || snapshot.data!.isEmpty) {
                return const Center(child: Text('No registrations yet'));
            }

            final registrations = snapshot.data!;
            
            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: registrations.length,
              itemBuilder: (context, index) {
                final item = registrations[index];
                final data = item['data'] as Map<String, dynamic>;
                // Try to find common fields
                final name = data['name'] ?? 'Unknown';
                final email = data['email'] ?? 'No Email';
                final date = DateTime.parse(item['created_at']).toLocal().toString().split('.')[0];

                return Card(
                  color: AppTheme.surface,
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: AppTheme.primary.withOpacity(0.2),
                      child: Text(name[0].toUpperCase(), style: const TextStyle(color: AppTheme.primary)),
                    ),
                    title: Text(name),
                    subtitle: Text(email),
                    trailing: Text(date, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                    onTap: () {
                        // Show full details
                        showDialog(
                            context: context,
                            builder: (c) => AlertDialog(
                                title: Text(name),
                                content: SingleChildScrollView(
                                    child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: data.entries.map((e) => Padding(
                                            padding: const EdgeInsets.only(bottom: 8.0),
                                            child: Text('${e.key}: ${e.value}', style: const TextStyle(fontSize: 14)),
                                        )).toList(),
                                    ),
                                ),
                                actions: [TextButton(onPressed: () => Navigator.pop(c), child: const Text('Close'))],
                            )
                        );
                    },
                  ),
                );
              },
            );
        }
      ),
    );
  }
}
