# Generated by Django 5.1.3 on 2024-12-07 16:09

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_remove_energydata_function'),
    ]

    operations = [
        migrations.CreateModel(
            name='ControlSetpoint',
            fields=[
                ('id', models.BigAutoField(db_column='id', primary_key=True, serialize=False)),
                ('node_id', models.IntegerField(db_column='node_id')),
                ('function', models.TextField(db_column='function', null=True)),
                ('setpoint', models.IntegerField(db_column='powsetpointer', null=True)),
                ('mode', models.TextField(db_column='mode', null=True)),
                ('temp', models.IntegerField(db_column='temp', null=True)),
                ('start_time', models.BigIntegerField(db_column=' start_time', null=True)),
                ('end_time', models.BigIntegerField(db_column='end_time', null=True)),
                ('status', models.IntegerField(db_column='status')),
                ('time', models.BigIntegerField(db_column='time')),
                ('room_id', models.ForeignKey(db_column='room_id', on_delete=django.db.models.deletion.CASCADE, to='api.room', to_field='room_id', verbose_name='Refering to room that this is trying to set value for')),
            ],
        ),
    ]
